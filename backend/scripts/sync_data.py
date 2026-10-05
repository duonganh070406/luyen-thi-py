#!/usr/bin/env python3
"""EduQuest Data Synchronization Utility.

Synchronizes question banks, markdown files, subject configs, and assets from the
root `data/` directory to `backend/data/` for Vercel serverless deployment.

Why this script exists:
  In development, the local source of truth for all subjects, markdown files, and
  notes is located at `<workspace_root>/data/`. However, when deploying backend
  services (such as to Vercel Serverless Functions), only the `backend/` directory
  is packaged. This script selectively mirrors necessary data files into
  `backend/data/` while excluding local artifacts (e.g., `history.json`, `test`,
  `scratch`, `.agents`).

Sync Rules:
  - Allowed files:
    * `<subject>/subject_config.json`
    * `<subject>/markdown/**` (question banks, exam markdown files, and images)
    * `<subject>/note/**` or `<subject>/note.md/**`
  - Excluded files:
    * `history.json` (personal test history is never synced or committed)
    * `scratch/`, `test/`, `.agents/`, and `__pycache__/` folders
  - Stale file cleanup:
    * Files previously copied to `backend/data/` that no longer exist in the
      source `data/` are automatically deleted to keep the deployment bundle lean.

Usage & Examples:
  - Default execution mirrors all tracked files and cleans stale files:
      python backend/scripts/sync_data.py
  - To test without modifying or deleting files on disk, use `--dry-run`:
      python backend/scripts/sync_data.py --dry-run
  - To inspect individual file copy and deletion actions, use `--verbose`:
      python backend/scripts/sync_data.py --verbose
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def is_valid_sync_file(rel: Path) -> bool:
    """Check whether a relative file path should be synchronized to backend/data.

    Args:
        rel: Relative path from the root data/ directory.

    Returns:
        True if the file matches synchronization criteria, False otherwise.
    """
    parts = rel.parts
    if not parts:
        return False
    if any(p in ["scratch", "test", ".agents", "__pycache__"] for p in parts):
        return False
    if rel.name == "history.json":
        return False
    if len(parts) == 2 and rel.name == "subject_config.json":
        return True
    if len(parts) >= 3 and parts[1] in ["markdown", "note", "note.md"]:
        return True
    return False


def sync_data(dry_run: bool = False, verbose: bool = False) -> None:
    """Synchronize data files from root data/ to backend/data/.

    Args:
        dry_run: If True, only simulate actions without modifying files.
        verbose: If True, log each copied and removed file.
    """
    script_dir = Path(__file__).resolve().parent
    backend_dir = script_dir.parent
    workspace_root = backend_dir.parent

    src_root = workspace_root / "data"
    dst_root = backend_dir / "data"

    if not src_root.is_dir():
        print(f"❌ Source directory not found: {src_root}")
        return

    mode_label = (
        "🔍 DRY-RUN (no files will be changed)" if dry_run else "⚡ ACTIVE SYNC"
    )
    print("=" * 80)
    print("🔄 EDUQUEST DATA SYNCHRONIZATION")
    print("=" * 80)
    print(f"  - Source Root : {src_root}")
    print(f"  - Destination : {dst_root}")
    print(f"  - Mode        : {mode_label}")
    print("-" * 80)

    copied_count = 0
    valid_rel_paths: set[Path] = set()

    for item in src_root.rglob("*"):
        if not item.is_file():
            continue
        rel = item.relative_to(src_root)
        if not is_valid_sync_file(rel):
            continue

        valid_rel_paths.add(rel)
        target = dst_root / rel

        # Check if file needs copying (missing or modified)
        needs_copy = True
        if target.is_file():
            try:
                src_stat = item.stat()
                dst_stat = target.stat()
                if (
                    src_stat.st_size == dst_stat.st_size
                    and abs(src_stat.st_mtime - dst_stat.st_mtime) < 1e-4
                ):
                    needs_copy = False
            except OSError:
                needs_copy = True

        if needs_copy:
            copied_count += 1
            if verbose:
                print(f"  [COPY] {rel}")
            if not dry_run:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(item, target)

    # Clean up stale files in destination that no longer exist in source
    removed_count = 0
    if dst_root.is_dir():
        for existing in dst_root.rglob("*"):
            if not existing.is_file():
                continue
            rel = existing.relative_to(dst_root)
            if rel not in valid_rel_paths:
                removed_count += 1
                if verbose:
                    print(f"  [REMOVE STALE] {rel}")
                if not dry_run:
                    existing.unlink()

    print(
        f"✅ Synced {copied_count} files, removed {removed_count} stale files "
        f"{'(simulated)' if dry_run else ''} in {dst_root}\n"
    )


def main() -> None:
    """CLI entry point for data synchronization."""
    parser = argparse.ArgumentParser(
        description="Synchronize question banks and configs to backend/data for deployment."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate synchronization without copying or deleting files",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Log each individual file copied or removed",
    )
    args = parser.parse_args()

    sync_data(dry_run=args.dry_run, verbose=args.verbose)


if __name__ == "__main__":
    main()
