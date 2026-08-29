import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim

# Add zk-circuits to path to load model definition
sys.path.insert(0, os.path.abspath("zk-circuits"))
from src.model_gen import RealEstateValuationModel, export_onnx_model, generate_calibration_and_input
from dataset_loader import get_dataloaders

def train_and_export(epochs: int = 15, lr: float = 0.005, output_dir: str = "zk-circuits"):
    os.makedirs(output_dir, exist_ok=True)
    
    train_loader, val_loader = get_dataloaders(batch_size=32, num_samples=1200)
    model = RealEstateValuationModel()
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    print("[+] Starting Real Estate Valuation Model Training...")
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for features, targets in train_loader:
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * features.size(0)
            
        epoch_loss = running_loss / len(train_loader.dataset)
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"    Epoch {epoch+1:02d}/{epochs} - Train MSE Loss: {epoch_loss:.4f}")
            
    model.eval()
    val_loss = 0.0
    with torch.no_grad():
        for features, targets in val_loader:
            outputs = model(features)
            loss = criterion(outputs, targets)
            val_loss += loss.item() * features.size(0)
    val_mse = val_loss / len(val_loader.dataset)
    print(f"[+] Training completed. Validation MSE: {val_mse:.4f}")
    
    # Save model checkpoint and export ONNX
    onnx_file = export_onnx_model(output_dir)
    generate_calibration_and_input(output_dir)
    print(f"[+] Artifacts updated in {output_dir}")
    return model

if __name__ == "__main__":
    circuits_dir = os.path.abspath("zk-circuits")
    train_and_export(output_dir=circuits_dir)
