"""
U-Net++ Multimodal Flood/Water Segmentation Architecture.
"""

from typing import Optional
import torch
import torch.nn as nn

try:
    import segmentation_models_pytorch as smp
    HAS_SMP = True
except ImportError:
    HAS_SMP = False


class _ConvBlock(nn.Module):
    def __init__(self, in_c: int, out_c: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_c, out_c, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_c, out_c, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


class NativeUNetPlusPlus(nn.Module):
    """
    Native PyTorch nested U-Net (U-Net++) implementation.
    Operates without external C-extension dependencies.
    """
    def __init__(self, in_channels: int = 6, classes: int = 3, nb_filter=(32, 64, 128, 256)):
        super().__init__()
        self.pool = nn.MaxPool2d(2, 2)
        self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)

        # Node (0, 0) to (3, 0)
        self.conv0_0 = _ConvBlock(in_channels, nb_filter[0])
        self.conv1_0 = _ConvBlock(nb_filter[0], nb_filter[1])
        self.conv2_0 = _ConvBlock(nb_filter[1], nb_filter[2])
        self.conv3_0 = _ConvBlock(nb_filter[2], nb_filter[3])

        # Nested nodes j=1
        self.conv0_1 = _ConvBlock(nb_filter[0] + nb_filter[1], nb_filter[0])
        self.conv1_1 = _ConvBlock(nb_filter[1] + nb_filter[2], nb_filter[1])
        self.conv2_1 = _ConvBlock(nb_filter[2] + nb_filter[3], nb_filter[2])

        # Nested nodes j=2
        self.conv0_2 = _ConvBlock(nb_filter[0] * 2 + nb_filter[1], nb_filter[0])
        self.conv1_2 = _ConvBlock(nb_filter[1] * 2 + nb_filter[2], nb_filter[1])

        # Nested nodes j=3
        self.conv0_3 = _ConvBlock(nb_filter[0] * 3 + nb_filter[1], nb_filter[0])

        self.final = nn.Conv2d(nb_filter[0], classes, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x0_0 = self.conv0_0(x)
        x1_0 = self.conv1_0(self.pool(x0_0))
        x0_1 = self.conv0_1(torch.cat([x0_0, self.up(x1_0)], 1))

        x2_0 = self.conv2_0(self.pool(x1_0))
        x1_1 = self.conv1_1(torch.cat([x1_0, self.up(x2_0)], 1))
        x0_2 = self.conv0_2(torch.cat([x0_0, x0_1, self.up(x1_1)], 1))

        x3_0 = self.conv3_0(self.pool(x2_0))
        x2_1 = self.conv2_1(torch.cat([x2_0, self.up(x3_0)], 1))
        x1_2 = self.conv1_2(torch.cat([x1_0, x1_1, self.up(x2_1)], 1))
        x0_3 = self.conv0_3(torch.cat([x0_0, x0_1, x0_2, self.up(x1_2)], 1))

        return self.final(x0_3)


class FloodUNetPlusPlus(nn.Module):
    """
    U-Net++ segmentation network. Uses segmentation_models_pytorch if available,
    otherwise defaults seamlessly to NativeUNetPlusPlus.
    """

    def __init__(
        self,
        in_channels: int = 6,
        classes: int = 3,
        encoder_name: str = "resnet34",
        encoder_weights: Optional[str] = "imagenet",
    ):
        super().__init__()
        self.in_channels = in_channels
        self.classes = classes

        if HAS_SMP:
            self.model = smp.UnetPlusPlus(
                encoder_name=encoder_name,
                encoder_weights=encoder_weights,
                in_channels=in_channels,
                classes=classes,
            )
        else:
            self.model = NativeUNetPlusPlus(in_channels=in_channels, classes=classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)
