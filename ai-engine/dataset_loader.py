import os
import json
import torch
from torch.utils.data import Dataset, DataLoader

class RealEstateAppraisalDataset(Dataset):
    """
    Real Estate Appraisal Dataset with synthetic feature generation and normalization metadata.
    Features:
    0: Square Footage ([300, 15000] sq ft)
    1: Bedrooms ([1, 10])
    2: Bathrooms ([1, 8])
    3: Property Age ([0, 120] years)
    4: Location Risk Score ([1, 100])
    """
    def __init__(self, num_samples: int = 1000, seed: int = 42):
        super().__init__()
        torch.manual_seed(seed)
        
        self.sqft = torch.randint(300, 15000, (num_samples, 1)).float()
        self.beds = torch.randint(1, 10, (num_samples, 1)).float()
        self.baths = torch.randint(1, 8, (num_samples, 1)).float()
        self.age = torch.randint(0, 120, (num_samples, 1)).float()
        self.location_risk = torch.randint(1, 100, (num_samples, 1)).float()
        
        self.features = torch.cat([self.sqft, self.beds, self.baths, self.age, self.location_risk], dim=1)
        
        # Ground-truth valuation model logic: Base price per sqft + bed/bath premium - age decay - risk penalty
        val_thousands = (
            (self.sqft * 0.25) +
            (self.beds * 25.0) +
            (self.baths * 40.0) -
            (self.age * 1.5) -
            (self.location_risk * 2.0) +
            100.0
        )
        # Ensure positive valuation output
        self.valuations = torch.clamp(val_thousands, min=50.0)

    def __len__(self):
        return len(self.features)

    def __getitem__(self, idx):
        return self.features[idx], self.valuations[idx]

def get_dataloaders(batch_size: int = 32, train_ratio: float = 0.8, num_samples: int = 1000):
    dataset = RealEstateAppraisalDataset(num_samples=num_samples)
    train_size = int(len(dataset) * train_ratio)
    val_size = len(dataset) - train_size
    
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader

if __name__ == "__main__":
    t_loader, v_loader = get_dataloaders()
    sample_feat, sample_val = next(iter(t_loader))
    print(f"[+] Loaded dataset batch - Features shape: {sample_feat.shape}, Valuations shape: {sample_val.shape}")
