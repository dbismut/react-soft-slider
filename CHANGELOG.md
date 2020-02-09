# Changelog

# 2.2.0 Release

**Summary:** Removes outer div, adds className as styling options.

### Changes

1. Removed outer div.
2. Remove `rootStyle` option.

### Added

1. Add `styleClassName` prop to style slides.

### Fixes

1. `slideAlign` behaviour in vertical mode should work properly.

# 2.1.2 Release

**Summary:** Added `indexRange` and `rootStyle` options.

### Added

1. `indexRange: [number, number]` config option to artificially limit the index ranges.
2. `rootStyle` option styles the inner root `<div/>`.

# 2.1.1 Release

**Summary:** This lib is now using `tsdx`.

### Added

1. `releaseSpring` config option.
2. `slideAlign` option to align slides.

### Changes

1. Removed intersection observer polyfill.

# 2.0.0 Release

**Summary:** Move to `react-use-gesture` v7 and `react-spring` v9. Shouldn't break anything but the trailing behavior is slightly different so you might want to keep v1.x.

### Added

1. `trailingDelay` option.

# 1.0.5-7 Releases

**Summary:** Package updates.

# 1.0.4 Release

**Summary:** Removes lodash dependency for `clamp`.

# 1.0.3 Release

**Summary:** Fixed unmount bug affecting IntersectionObserver.

# 1.0.2 Release

**Summary:** Deps update.

## 1.0.1 Release

**Summary:** Added vertical mode.

### Added

1. Added vertical prop to set a vertical sliding mode.
