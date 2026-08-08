#!/usr/bin/env python3
"""Small, configurable auto-clicker for a Codex UI button or any screen point.

Examples:
  python auto_click_codex.py --x 1200 --y 760 --count 5
  python auto_click_codex.py --image codex_button.png --count 1
  python auto_click_codex.py --x 1200 --y 760 --dry-run

Install dependency first:
  python -m pip install pyautogui

Safety:
  Move the mouse to the top-left corner to trigger PyAutoGUI's fail-safe stop.
"""

from __future__ import annotations

import argparse
import sys
import time
from dataclasses import dataclass

try:
    import pyautogui
except ImportError:  # pragma: no cover - exercised only without optional dependency
    pyautogui = None


@dataclass(frozen=True)
class ClickTarget:
    """A concrete point on the screen."""

    x: int
    y: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Automatically click a Codex button by coordinates or screenshot image."
    )
    parser.add_argument("--image", help="Path to an image of the button to locate on screen.")
    parser.add_argument("--position", help="Click position as 'x,y', for example '1200,760'.")
    parser.add_argument("--x", type=int, help="X coordinate to click. Requires --y.")
    parser.add_argument("--y", type=int, help="Y coordinate to click. Requires --x.")
    parser.add_argument("--count", type=int, default=1, help="Number of clicks to perform.")
    parser.add_argument("--interval", type=float, default=1.0, help="Seconds between clicks.")
    parser.add_argument("--delay", type=float, default=3.0, help="Seconds to wait before the first click.")
    parser.add_argument("--confidence", type=float, default=0.9, help="Image-match confidence.")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without moving or clicking.")
    args = parser.parse_args()

    if (args.x is None) != (args.y is None):
        parser.error("--x and --y must be used together")
    target_count = sum([bool(args.image), bool(args.position), args.x is not None])
    if target_count != 1:
        parser.error("Provide exactly one target: --image, --position, or both --x and --y")
    if args.count < 1:
        parser.error("--count must be at least 1")
    if args.interval < 0 or args.delay < 0:
        parser.error("--interval and --delay must be non-negative")
    return args


def require_pyautogui() -> None:
    if pyautogui is None:
        sys.exit("Missing dependency: install it with `python -m pip install pyautogui`.")
    pyautogui.FAILSAFE = True


def parse_position(position: str) -> ClickTarget:
    try:
        x_text, y_text = position.split(",", maxsplit=1)
        return ClickTarget(x=int(x_text.strip()), y=int(y_text.strip()))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("position must look like 'x,y'") from exc


def find_image_target(image_path: str, confidence: float) -> ClickTarget:
    require_pyautogui()
    location = pyautogui.locateCenterOnScreen(image_path, confidence=confidence)
    if location is None:
        sys.exit(f"Could not find image on screen: {image_path}")
    return ClickTarget(x=location.x, y=location.y)


def resolve_target(args: argparse.Namespace) -> ClickTarget:
    if args.image:
        return find_image_target(args.image, args.confidence)
    if args.position:
        return parse_position(args.position)
    return ClickTarget(x=args.x, y=args.y)


def click_target(target: ClickTarget, dry_run: bool) -> None:
    if dry_run:
        print(f"DRY RUN: would click ({target.x}, {target.y})")
        return
    require_pyautogui()
    pyautogui.click(target.x, target.y)


def main() -> int:
    args = parse_args()
    target = resolve_target(args)
    print(f"Starting in {args.delay:.1f}s. Move mouse to top-left to abort.")
    time.sleep(args.delay)
    for index in range(args.count):
        click_target(target, args.dry_run)
        if index < args.count - 1:
            time.sleep(args.interval)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
