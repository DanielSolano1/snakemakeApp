from snakemake.parser import parse
from types import SimpleNamespace
import yaml, os, glob, ast, json

# Raw Snakemake File ==> snakemake file/meta.yaml parser ==> Python code ==> AST parser

# snakefile_path = "snakemake-wrappers/bio/samtools/index/test/Snakefile"

class DummySourceCache:
    def open(self, path):
        return open(path.get_path_or_uri(), 'r')

class FakeSourceFile:
    def __init__(self, path):
        self.path = path

    def get_path_or_uri(self):
        return self.path

workflow = SimpleNamespace(
    sourcecache=DummySourceCache()
)

linemap = {}



all_rules = []
seen_rules = set()

def find_yaml(path):
    """
    Find the meta.yaml file in the directory structure.
    """
    while True:
        if os.path.exists(os.path.join(path, "meta.yaml")):
            return os.path.join(path, "meta.yaml")
        path = os.path.dirname(path)

def extract_yaml(path):
    """
    Extract input and output types from the meta.yaml file.
    """
    with open(path,'r') as f:
        meta = yaml.safe_load(f)

    input_types = meta.get('input', {})
    output_types = meta.get('output', {})
    print("Input types:", input_types)  
    print("Output types:", output_types)
    return input_types, output_types

def snakemake(path):

    meta_dir = os.path.dirname(os.path.dirname(path))  # One level up from /test/
    meta_path = os.path.join(meta_dir, "meta.yaml")
    input_types,output_types = extract_yaml(meta_path)


    with open(path, 'r') as f:
        snakefile_content = f.read()

    node = ast.parse(parsed_code)
    print("AST representation of the parsed code:")
    print(node._fields)
    print(node.body[0]._fields)
    print(node.body[0].decorator_list[0])

    rule_info = {
        "name": None,
        "input": {},
        "output": {},
        "log": {},
        "params": {},
        "wrapper": {},
        "input_types": input_types or "undefined",
        "output_types": output_types or "undefined",
        "rule": snakefile_content or "undefined"
    }

    for decorator in node.body[0].decorator_list:
        if isinstance(decorator, ast.Call): # If it's a function call like @workflow.input(...)
            #.func = workflow.input => .attr = input
            func_name = decorator.func.attr
            if func_name == "rule":
                for kw in decorator.keywords:

                    if kw.arg == "name":
                        rule_name = ast.literal_eval(kw.value)
                        rule_info["name"] = rule_name
                        print(f"Rule name: {rule_name}")
            if func_name in ["input", "output", "log", "params","wrapper"]:
                if decorator.keywords:
                    # reads=["reads/{sample}.1.fastq"], idx=multiext("genome", ...)
                    for kw in decorator.keywords:
                        # kw.arg is the variable name like "reads"
                        # kw.value is the expression or literal assigned
                        try:
                            # is a list, string, dict, or number
                            value = ast.literal_eval(kw.value)
                        except Exception:
                            # it's a function call (e.g., multiext(...)) 
                            value = ast.unparse(kw.value) if hasattr(ast, "unparse") else "<non-literal expression>"
                        rule_info[func_name][kw.arg] = value
                        print(f"{func_name}.{kw.arg} = {value}")
                elif decorator.args:
                    try:
                        value = ast.literal_eval(decorator.args[0])
                    except Exception:
                        value = ast.unparse(decorator.args[0]) if hasattr(ast, "unparse") else "<non-literal expression>"
                    rule_info[func_name]["default"] = value
                    print(f"{func_name}.default = {value}")
        else:
            print(f"Decorator is not a Call: {decorator}")

    # print("\nFinal Parsed Rule Info:\n", json.dumps(rule_info, indent=2))
    if rule_name in seen_rules:
        print(f"Skipping already seen rule: {rule_info['name']}")
    else:
        print(f"Adding new rule: {rule_info['name']}")
        all_rules.append(rule_info)
        seen_rules.add(rule_name)



# all_paths = glob.glob("snakemake-wrappers/**/test/Snakefile", recursive=True)
# all_paths = glob.glob("snakemake-wrappers/bio/**/test/Snakefile", recursive=True)
# your raw patterns

# ------------------------------------------------------------
# ⚠️  WARNING: Some wrappers declare the same rule name
# (e.g. “bwa_mem” appears in both bwa/mem and bwa/mem‑samblaster).
# If you don’t check for duplicates, the second one silently gets dropped!
# We need to find a solution for this later.
# ------------------------------------------------------------

patterns = [
    "snakemake-wrappers/bio/bwa/**/test/Snakefile",
    "snakemake-wrappers/bio/samtools/**/test/Snakefile",
    "snakemake-wrappers/bio/bcftools/**/test/Snakefile",
]

all_paths = sorted([filepath for pattern in patterns for filepath in glob.glob(pattern, recursive=True)])

for path in all_paths:
    print(f"\nPROCESSIN {path}...")
    try:
        sourcefile = FakeSourceFile(path)
        parsed_code, rule_count = parse(sourcefile, workflow, linemap)

        snakemake(path)
    except Exception as e:
        print(f"Error in {path}: {e}")


json_path = "public/rules/parsed_rule.json"
if os.path.exists(json_path):
    with open(json_path, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = {"rules": []}
else:
    data = {"rules": []}

sorted_rules = sorted(all_rules, key=lambda rule: rule.get("name", ""))
data["rules"].extend(sorted_rules)

with open(json_path, "w") as f:
    json.dump(data, f, indent=2)