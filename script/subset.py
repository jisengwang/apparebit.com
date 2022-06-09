#!/usr/bin/env python

# (C) Copyright 2019-2022 Robert Grimm
# Licensed under the MIT License (https://opensource.org/licenses/MIT)

# Subset a font (such as DejaVu Sans Mono) to Latin alphabet while converting to
# WOFF and WOFF2 as well. This script requires that fontTools
# (https://github.com/fonttools/fonttools) with the 'woff' extra are installed:
#
#     pip install fonttools[woff]
#
# After installation, the list of installed packages
#
#     pip list
#
# should include both 'Brotli' and 'zopfli'.

import os.path
import re
import subprocess
import sys

R1 = re.compile(r"[a-z](?=[A-Z])")
R2 = re.compile(r"[A-Z](?=[A-Z][a-z])")

def slugify(name):
    """Convert the mixed case file name into lower case with dashes."""
    name = R1.sub("\g<0>-", name)
    name = R2.sub("\g<0>-", name)
    name = name.lower()
    name = name.replace("deja-vu", "dejavu")
    name = name.replace("-lgc", "")
    if not "-bold" in name and not "-oblique" in name:
        name += "-book"
    return name

# Conveniently, Zach Leat's GlyphHanger has a list of relevant Unicode codepoints.
# See https://github.com/zachleat/glyphhanger/blob/master/src/GlyphHangerWhitelist.js

RANGES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,"
    "U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,"
    "U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)

def convert(input, format):
    """Convert the input font in TTF or OTF format to either 'woff' or 'woff2'."""
    input_file = os.path.basename(input)
    input_stem, input_format = os.path.splitext(input_file)
    input_format = input_format[1:]

    # Validate input and output formats.
    if input_format != "ttf" and input_format != "otf":
        raise ValueError(f'Invalid input format "{input_format}"')

    if format != "woff" and format != "woff2":
        raise ValueError(f'Invalid output format "{format}"')

    output = slugify(input_stem) + "." + format
    print(f'\nConvert {input} -> {output}')

    command = [
        'pyftsubset',
        input,
        f'--unicodes={RANGES}',
        "--layout-features='*'",
        # Necessary for correctly compressed WOFF2.
        f'--flavor={format}',
        f'--output-file={output}',
    ]
    if format == "woff":
        command.append("--with-zopfli")

    subprocess.run(command)

if __name__ == "__main__":
    for name in sys.argv[1:]:
        convert(name, "woff")
        convert(name, "woff2")
