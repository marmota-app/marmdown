# Design Considerations

## Blocks and Inlines

A Markdown Document [consists of blocks](https://github.github.com/gfm/#blocks-and-inlines), 
and those _blocks_ can contain other blocks and _inlines_.

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

[Read more about blocks-of-text parsing](./blocks-of-text-parsing.md)

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

[Read more about parsing updates](./parsing-updates.md)
