# Design Considerations

## Empty Lines

When any parser encounters an empty line, it will pass it to the previous
inner parser (if available).

This inner parser can then check if the empty line has any consequences
for that current element. Suppose the current parser is a parser for
sections, and the last element inside was a paragraph. When the section
parser encounters an empty line, it will pass it on to the paragraph, which
in turn would end the current paragraph, allowing new content to be parsed.

If there is no previous inner parser, or if the previous inner parser ended
the current element (it returned null), the empty line is ignored and **not**
passed on to all subsequent parsers.

## Blocks and Inlines

A Markdown Document [consists of blocks](https://github.github.com/gfm/#blocks-and-inlines), 
and those _blocks_ can contain other blocks and _inlines_. We call both blocks
and inlines {@link Element}.

A block can span multiple lines, and it can contain blocks that, again, span
multiple lines. Here's an aside that contains a block quote and a paragraph.
The block quote contains two more paragraphs.

```
^ > This is the first
^ > paragraph inside the
^ > block quote.
^ >
^ > The second paragraph
^ > inside the block quote
^ And here's another paragraph
```

Inlines cannot span multiple lines. The `**`s below do not create a strong text
content, but the `_`s do create an emphazised text content:

```
Here is `some valid emphazised content` while **there is
no strong content** since inline content cannot span multiple
lines
```

_Container blocks_ can contain other blocks, while _leaf blocks_ cannot.

## Parsing Blocks of Text

Since blocks can be nested (as shown above), marmdown parses the document
(mostly) line-by-line. But actually, it operates on different blocks of
text. Every block parser must be able to resume a block with more text.

A block might be based on a continuous block of text (like the aside in
the example above) or on multiple, non continous blocks of text (like the
first paragraph that is inside an aside **and** a block quote).

How exactly blocks of text are parsed and the resulting data structures
also depends on how updates are processed by the parser - see below.

[Read more about blocks-of-text parsing]{@tutorial blocks-of-text-parsing}

## Parsing Updates

When used together with an editor, there will be updates to the underlying
text the document is based on: Parts of the document can be replaces with
differenent text.

* Inserting some text means replacing a zero-length string with the new text
* Deleting some text means replacing a part of the text with the zero-lenght
  string `''`
* Cut-and-Paste, mark-and-type, etc. can also be modeled as replacing a part of
  the document with a different string.

When and _update_ like that happens, the parser must be able to only change
the elements of the document that are affected by that update.

It starts by trying to parse the innermost element that might be affected
by the update. If re-parsing that element returns a valid result **and** the
changed text could be parsed completely, the parsing stops there. Otherwise,
it tries to parse the parent element.

[Read more about parsing updates]{@tutorial parsing-updates}
