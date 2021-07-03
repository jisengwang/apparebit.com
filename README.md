# apparebit.com

This repository contains most of the sources for my personal website
[apparebit.com](https://apparebit.com). The sources for the [.htaccess
configuration](https://github.com/apparebit/server-configs-apache) are in a
separate, public repository. So are the sources for
[site:forge](https://github.com/apparebit/siteforge), which serves as
Apparebit's static website generator. Most typefaces on Apparebit are
commercially licensed and thus not publicly accessible. Git submodules are
effective at isolating them in another, private repository, while still being
readily accessible by myself.


## Preparing Images

**Raster images** via [RetroBatch](https://flyingmeat.com/retrobatch/):

  * Delete metadata.
  * Normalize color profile to sRGB.
  * Scale to desired size.
  * Change bits per channel to 8.
  * Remove color profile.
  * Add copyright notice.
  * Export as JPEG at 80% quality and WebP at 85% quality.

**Vector images** mostly manually:

  * Prepare image.
  * Move flush to origin.
  * Reduce document size to size of image elements.
  * Increase to integer document size while centering elements.
  * Export with these settings:
      * 96 dpi;
      * Text as curves;
      * Transforms flattened;
      * Relative coordinates;
      * `viewBox` attribute.
  * Manually edit file to remove:
      * XML declaration;
      * Document type;
      * Name spaces besides `xmlns="http://www.w3.org/2000/svg"`;
      * Useless styles including fill rule.
  * Maybe process with [SVGOMG](https://jakearchibald.github.io/svgomg/).


## Licensing

This repository being publicly accessible does *not* imply that its contents are
open source. I chose to develop in the open to support the open web. But unless
otherwise and explicitly noted, I reserve *all* rights to the contents of this
repository, including *all* writing and images. However, the following documents
and code are available under permissive licenses:

  * Apparebit's privacy policy under [CC BY-SA
    4.0](https://creativecommons.org/licenses/by-sa/4.0/) terms.
  * Apparebit's [styles](content/assets/form.css) and
    [scripts](content/assets/function.js) under
    [MIT](https://opensource.org/licenses/MIT) terms.

Furthermore, [site:forge](https://github.com/apparebit/siteforge), the static
website generator I am developing in tandem with and support of Apparebit, is
also licensed under [MIT](LICENSE) terms.

— *Robert Grimm*
