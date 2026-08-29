import os
import json
import torch
import torch.nn as nn

class RealEstateValuationModel(nn.Module):
    """
    Lightweight, ZK-friendly real estate appraisal neural network.
    Inputs: [Square Footage, Bedrooms, Bathrooms, Age, Location Risk Score]
    Output: Estimated Collateral Appraisal Valuation (in thousands USD)
    """
    def __init__(self):
        super(RealEstateValuationModel, self).__init__()
        # Normalization scale vector for 5 input features
        # [15000.0, 10.0, 8.0, 120.0, 100.0]
        self.register_buffer("norm_scale", torch.tensor([15000.0, 10.0, 8.0, 120.0, 100.0], dtype=torch.float32))
        
        self.net = nn.Sequential(
            nn.Linear(5, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1)
        )
        # Initialize weights deterministically for test reproducible predictions
        torch.manual_seed(42)
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_uniform_(m.weight, nonlinearity="relu")
                nn.init.zeros_(m.bias)

    def forward(self, x):
        normalized = x / self.norm_scale
        return self.net(normalized)

def generate_calibration_and_input(circuits_dir: str = "zk-circuits", num_calibration_samples: int = 60):
    os.makedirs(circuits_dir, exist_ok=True)
    
    torch.manual_seed(1337)
    # Generate realistic feature range samples
    sqft = torch.randint(300, 15000, (num_calibration_samples, 1)).float()
    beds = torch.randint(1, 10, (num_calibration_samples, 1)).float()
    baths = torch.randint(1, 8, (num_calibration_samples, 1)).float()
    age = torch.randint(0, 120, (num_calibration_samples, 1)).float()
    location_risk = torch.randint(1, 100, (num_calibration_samples, 1)).float()
    
    calib_tensor = torch.cat([sqft, beds, baths, age, location_risk], dim=1)
    calib_list = calib_tensor.numpy().tolist()
    
    calib_path = os.path.join(circuits_dir, "input_calibration.json")
    with open(calib_path, "w") as f:
        json.dump({"input_data": calib_list}, f, indent=2)
        
    sample_input = calib_list[0]
    input_path = os.path.join(circuits_dir, "input.json")
    with open(input_path, "w") as f:
        json.dump({"input_data": [sample_input]}, f, indent=2)
        
    print(f"[+] Exported calibration data ({num_calibration_samples} samples) -> {calib_path}")
    print(f"[+] Exported sample input -> {input_path}")
    return calib_tensor

def export_onnx_model(circuits_dir: str = "zk-circuits"):
    os.makedirs(circuits_dir, exist_ok=True)
    model = RealEstateValuationModel()
    model.eval()
    
    dummy_input = torch.tensor([[2500.0, 3.0, 2.5, 15.0, 25.0]], dtype=torch.float32)
    onnx_path = os.path.join(circuits_dir, "model.onnx")
    
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=13,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamo=False
    )
    print(f"[+] Exported PyTorch model to ONNX -> {onnx_path}")
    return model, onnx_path

if __name__ == "__main__":
    circuits = os.path.abspath("zk-circuits")
    model, onnx_file = export_onnx_model(circuits)
    generate_calibration_and_input(circuits)
