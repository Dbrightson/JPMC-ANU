import torch
from typing import Any, List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer

class HFSOCModel:
    """Wrapper for HuggingFace models to match SOCLanguageModel interface."""
    def __init__(self, model_name: str, device: str = None):
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Loading model {model_name} on {self.device}...")
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
        self.model.eval()

    def to(self, device):
        self.model.to(device)
        self.device = device
        return self

    def eval(self):
        self.model.eval()

    def generate(self, input_ids, **kwargs):
        """Pass through to HF model generate."""
        return self.model.generate(input_ids, **kwargs)

    def __call__(self, *args, **kwargs):
        return self.model(*args, **kwargs)


class HFTokenizerWrapper:
    """Wrapper for HuggingFace tokenizer to match BaseSOCAgent expectations."""
    def __init__(self, model_name: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        # Mock max_length if not set, typical for HF tokenizers
        self.max_length = self.tokenizer.model_max_length if self.tokenizer.model_max_length < 100000 else 2048

    def encode(self, text, max_length=None, truncation=True):
        """
        BaseSOCAgent expects this to return an object 'inputs' 
        where inputs.input_ids is the tensor/list.
        """
        # We use __call__ to get the batch encoding object
        return self.tokenizer(
            text, 
            max_length=max_length, 
            truncation=truncation, 
            return_tensors=None  # We return standard python lists, let agent convert to tensor
        )
    
    def decode(self, token_ids):
        return self.tokenizer.decode(token_ids, skip_special_tokens=True)

# Patch for the 'inputs.input_ids' access in BaseSOCAgent
# BaseSOCAgent does: inputs = tokenizer.encode(...) -> input_ids = torch.tensor([inputs.input_ids])
# HF tokenizer(text) returns a dict-like object where obj['input_ids'] is the list.
# We need obj.input_ids to work.
# Fortunately, BatchEncoding in transformers supports attribute access for keys!
# So standard self.tokenizer(text) should work IF it returns BatchEncoding.
# Let's verify if we need to wrap it.
# BaseSOCAgent expects `inputs` to have `input_ids`. 
# HF `tokenizer(...)` returns `BatchEncoding` which HAS `input_ids` as attribute (usually).
# But checking `BaseSOCAgent` again:
# input_ids = torch.tensor([inputs.input_ids])
# This implies inputs.input_ids is a LIST of ints (for a single sequence).
# Only catch: `BaseSOCAgent` call:
# inputs = self.tokenizer.encode(..., max_length=..., truncation=True)
# **`encode`** in HF returns a LIST of IDs, NOT an object.
# `__call__` returns the object.
# So I DO need to wrap `encode` to behave like `__call__` but return an object.

class CompatibleTokenizer:
    def __init__(self, model_name):
        self._tokenizer = AutoTokenizer.from_pretrained(model_name)
        if self._tokenizer.pad_token is None:
            self._tokenizer.pad_token = self._tokenizer.eos_token
        self.max_length = 2048

    def encode(self, text, max_length=None, truncation=True):
        # BaseSOCAgent expects an object with .input_ids
        encoding = self._tokenizer(
            text,
            max_length=max_length,
            truncation=truncation,
            add_special_tokens=True
        )
        # Verify BatchEncoding has dot access? Yes usually.
        # But to be safe, return a simple Namespace or object
        class Output:
            def __init__(self, data):
                self.input_ids = data['input_ids']
                self.attention_mask = data.get('attention_mask')
        
        return Output(encoding)

    def decode(self, token_ids):
        return self._tokenizer.decode(token_ids, skip_special_tokens=True)
