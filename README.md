# Codex Auto Clicker

This repository contains a small Python helper that can automatically click a Codex button, or any other point on your screen.

## Setup

```bash
python -m pip install pyautogui
```

If you want to click by matching a screenshot image, PyAutoGUI may also need OpenCV support:

```bash
python -m pip install opencv-python
```

## Usage

Click a fixed position:

```bash
python auto_click_codex.py --position 1200,760 --count 3 --interval 2
```

Equivalent coordinate flags:

```bash
python auto_click_codex.py --x 1200 --y 760 --count 3
```

Click the center of a button found from a screenshot:

```bash
python auto_click_codex.py --image codex_button.png --count 1 --confidence 0.9
```

Preview without clicking:

```bash
python auto_click_codex.py --position 1200,760 --dry-run
```

## Safety

PyAutoGUI's fail-safe is enabled. Move the mouse to the top-left corner of the screen to abort the script.
