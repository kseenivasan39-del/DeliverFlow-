import os
import glob

def replace_in_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if 'http://localhost:8000' in content:
                        new_content = content.replace('http://localhost:8000', 'https://deliverflow-2foc.onrender.com')
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {filepath}")
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

replace_in_files('app')
replace_in_files('components')
replace_in_files('scripts')
