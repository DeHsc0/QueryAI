#!/usr/bin/env python3

# usage: python combine_public_with_gt.py <public_jsonl_path> <gt_jsonl_path> <output_jsonl_path>
# E.g. For full: python combine_public_with_gt.py /path/to/public/bird_interact_data.jsonl /path/to/gt/bird_interact_full_gt_kg_testcases_08022.jsonl /path/to/dst/bird_interact_data.jsonl

import json
import sys
from typing import Dict


def combine_public_with_gt(public_jsonl_path: str, gt_jsonl_path: str, output_jsonl_path: str) -> None:
    """Combine public JSONL with ground truth data by matching instance_id."""
    
    # 1. Load ground truth data into a dictionary keyed by instance_id
    gt_data: Dict[str, dict] = {}
    
    with open(gt_jsonl_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                gt_entry = json.loads(line)
                instance_id = gt_entry.get('instance_id')
                if instance_id:
                    gt_data[instance_id] = gt_entry
            except json.JSONDecodeError:
                continue
    
    # 2. Read public data and merge with GT
    with open(public_jsonl_path, 'r') as f_in, open(output_jsonl_path, 'w') as f_out:
        for line in f_in:
            line = line.strip()
            if not line:
                continue
            try:
                public_entry = json.loads(line)
                instance_id = public_entry.get('instance_id')
                
                if not instance_id:
                    continue
                
                # Merge GT data if available
                if instance_id in gt_data:
                    gt_entry = gt_data[instance_id]
                    
                    # Merge main GT fields
                    public_entry['sol_sql'] = gt_entry.get('sol_sql', [])
                    public_entry['external_knowledge'] = gt_entry.get('external_knowledge', [])
                    public_entry['test_cases'] = gt_entry.get('test_cases', [])
                    
                    # Merge follow_up GT fields if present
                    if 'follow_up' in gt_entry and isinstance(gt_entry['follow_up'], dict):
                        if 'follow_up' not in public_entry:
                            public_entry['follow_up'] = {}
                        public_entry['follow_up']['sol_sql'] = gt_entry['follow_up'].get('sol_sql', [])
                        public_entry['follow_up']['external_knowledge'] = gt_entry['follow_up'].get('external_knowledge', [])
                        public_entry['follow_up']['test_cases'] = gt_entry['follow_up'].get('test_cases', [])
                
                f_out.write(json.dumps(public_entry) + '\n')
                
            except json.JSONDecodeError:
                continue


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(1)
    
    public_path = sys.argv[1]
    gt_path = sys.argv[2]
    output_path = sys.argv[3]
    
    combine_public_with_gt(public_path, gt_path, output_path)
