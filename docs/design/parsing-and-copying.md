# Non-Copying Parsing

This markdown parser implementation should only copy text when it's absolutely
necessary.

## General Implementation

Almost every object in the parsed tree should keep track of three values: The
original `text` (a reference to the complete document text **or** a copy of
the relevant text, as necessary), the current `start` index in the complete
document and the `length` of the content.

After parsing updates, the `start` index and `length` refer to the updated
document that can be reproduced by calling `asText` on the complete document.

## Parsing Updates

When [parsing updates]{@tutorial parsing-updates}, updates elements change
their [line content]{@link LineContent} on to match the updated line content.
From then on, the updated document structure does not correspond directly to
the original text of the document anymore.

Also, the updated elements must change their `length` value and all following
elements must update their `start` value.

## Whole Text Snippet vs. Parsing a Part

Blocks get the text line-by-line and always parse the whole line&mdash;so,
they always parse the whole text snippet they got. The caller does not have
to check the length of the parsed line, since it must always be the last
line.

Inlines, on the other hand, do not necessarily parse the while line. They
can stop early because a line can consist of multiple inlines. The caller
must check the length of the parsed line, and parse the text after the inline,
if there is some. Inlines cannot span multiple lines, though.
