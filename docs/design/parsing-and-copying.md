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
