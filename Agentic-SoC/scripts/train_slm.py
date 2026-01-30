import json
import logging
import os
os.environ["WANDB_DISABLED"] = "true"
import torch
from torch.utils.data import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SLMTrainer")

class SecurityDataset(Dataset):
    """
    Dataset that converts generated security events into instruction-following format.
    Ref: Memory-Architecture.txt (Triage & Intel Agent roles)
    """
    def __init__(self, file_paths, tokenizer, max_length=512):
        self.examples = []
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        for path in file_paths:
            logger.info(f"Loading data from {path}")
            if not os.path.exists(path):
                logger.warning(f"File not found: {path}")
                continue
                
            with open(path, 'r') as f:
                # Handle both array of objects and line-delimited JSON
                first_char = f.read(1)
                f.seek(0)
                if first_char == '[':
                    data = json.load(f)
                else:
                    data = [json.loads(line) for line in f if line.strip()]
            
            for item in data:
                text = self._format_example(item)
                self.examples.append(text)
                
        logger.info(f"Loaded {len(self.examples)} training examples")

    def _format_example(self, item):
        """Format raw event into Training Example: Input -> Rational -> Decision"""
        # Distinguish between Triage and Intel/Response based on content
        
        if "mitre_attack" in item: # Network/Triage
            mitre = item.get('mitre_attack') or {}
            input_text = f"Analyze this network alert:\nTimestamp: {item.get('timestamp')}\nSource: {item.get('source_ip')}\nEvent: {item.get('alert_name')}\nAction: {item.get('action')}"
            output_text = f"Verdict: {item.get('severity')}\nExplanation: This activity matches {mitre.get('technique_name', 'known pattern')}."
        
        elif "agent_type" in item: # Agentic SOC
            input_text = f"Task: {item.get('agent_type')} task for {item.get('target', 'unknown entity')}"
            output_text = f"Action: {item.get('actions_taken')}\nOutcome: {item.get('outcome')}"
        
        else: # Generic fallback
            input_text = f"Analyze security event: {json.dumps(item)}"
            output_text = f"Severity: {item.get('severity', 'unknown')}"
            
        # Standard Instruction tuning format
        return f"### Input:\n{input_text}\n\n### Response:\n{output_text}<|endoftext|>"

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        return self.tokenizer(
            self.examples[idx],
            truncation=True,
            max_length=self.max_length,
            padding="max_length"
        )

def train():
    MODEL_NAME = "distilgpt2" # As per POC constraints (Small LM)
    # Note: Memory-Architecture.txt suggests 2B-7B, but we use distilgpt2 for speed in this demo.
    
    logger.info(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
    
    # Load Datasets
    train_files = [
        "data/network_events.json",
        "data/agentic_events.json",
        "data/incident_events.json" # Best effort if it exists
    ]
    
    dataset = SecurityDataset(train_files, tokenizer)
    
    if len(dataset) == 0:
        logger.error("No training data found. Aborting.")
        return

    # Training Arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=3,              # Fast training
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        learning_rate=5e-5,
        weight_decay=0.01,
        logging_steps=10,
        save_steps=50,
        save_total_limit=2,
        prediction_loss_only=True,
        use_cpu=not torch.cuda.is_available(), # Fallback for CPU
        fp16=torch.cuda.is_available(),        # Optimization
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
    )
    
    logger.info("Starting training...")
    trainer.train()
    
    logger.info("Saving model...")
    model.save_pretrained("./fine_tuned_soc_model")
    tokenizer.save_pretrained("./fine_tuned_soc_model")
    logger.info("Training complete. Model saved to ./fine_tuned_soc_model")

if __name__ == "__main__":
    train()
