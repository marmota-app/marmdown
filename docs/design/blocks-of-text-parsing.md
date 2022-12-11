# Line-by-Line Parsing

**TODO Continuous Blocks** might not be needed in the code. If that turns out
to be true, remove them from here.

_Everything in this document is slightly simplified because it does not yet consider [options parsing]{@tutorial options.md}_

`Marmdown` itself splits the original text into lines. To do this, it splits
the lines at _line endings_ where a _line ending_ can be either `\r`, `\n`
or `\r\n`. (Actually, `Marmdown` does not **split** the text&mdash;it does
not technically create substrings from the text&mdash;it only finds the start
and end of lines. Read more in [non-copying parsing]{@tutorial non-copying-parsing})

It knows all the block parsers that could potentially parse toplevel content
and passes the current content to all of them, until one of them returns a result.

```
   +----------+     n +-------------+
   | Marmdown | ----> | BlockParser |
   +----------+       +-------------+
```

Since all block parsers can be toplevel parsers, `Marmdown` contains a list of
all block parsers, but from the PoV of `Marmdown`, those are called "toplevel
parsers".

A block parser can be a parser that parses _leaf blocks_ or a parser that parses
_container blocks_.

```
                 +-------------+
                 | BlockParser |
                 +-------------+
                       ^
                       |
           +-----------+-------------+
           |                         |
   +----------------+     +---------------------+
   | LeafBlockParser|     | ContainerBlockParser|
   +----------------+     +---------------------+
```

Every `LeafBlockParser` knows `LeafParser`s, while `ContainerBlockParser`s know
all `BlockParser`s.

```
   +-----------------+     n +------------+
   | LeafBlockParser | ----> | LeafParser |
   +-----------------+       +------------+

   +----------------------+     n +-------------+
   | ContainerBlockParser | ----> | BlockParser |
   +----------------------+       +-------------+
```

## Block Content (simplified)

Consider the following block:

```
> The first paragraph,
> spanning **two** lines
>
> Another paragraph
```

Here we have a generic block, that spans four lines and contains two paragraphs.
To parse this block, the `GenericBlockParser` passes the first line to all parsers.
The `ParagraphParser` ist the first one to respond to it, so it gets to parse the
first line.

Because the `ParagraphParser` did respond to the first line, it gets a chance to
parse the second line too, and responds to that, too. The line becomes part of the
first paragraph.

At the "empty" line (from the PoV of the `GenericBlockParser`), everything starts
over again, and the fourth line is passed to all parsers again. But only the
`ParagraphParser` can parse it, and that creates a second paragraph.

The resulting data structure **could** look like this (but in reality, this 
**does not work**, it's more complicated&mdash;see below):

```
+-----+        +----+        +---------------------------------+
| GB1 | --+--> | P1 | --+--> | P1L1                            |
+-----+   |    +----+   |    | content: "The first paragraph," |
          |             |    +---------------------------------+
          |
          |             |    +-----------------------------------+
          |             +--> | P1L2                              |
          |                  | content: "spanning **two** lines" |
          |                  +-----------------------------------+
          |
          |    +----+        +------------------------------+
          +--> | P2 | -----> | P2L1                         |
               +----+        | content: "Another paragraph" |
                             +------------------------------+
```

`GB1 ` ... Generic Block 1  
`P1  ` ... Paragraph 1  
`P1L1` ... Paragraph 1, Line 1  
`P1L2` ... Paragraph 1, Line 1  
`P2  ` ... Paragraph 2  
`P2L1` ... Paragraph 2, Line 1

## The Text Split

When we look at how the text is split, we get a slightly different image:

```
> The first paragraph,\n> spanning **two** lines\n>\n> Another paragraph
| |                  | || |                    | || || |               |
| \--- P1L1 ---------/ || \--- P1L2 -----------/ || || \--- P2L1 ------+
|                      ||                        || ||                 |
\--- GB1L1 ------------/\--- GB1L2 --------------/\*/\--- GB1L4 -------/

* GB1L3 is the single character ">\n"
```

There is a relationship between the lines of _Generic Block 1_ and the lines
of the contained paragraphs!

Also, _Generic Block 1_ forms a continuous block of text, while the contained
paragraphs do not! How can we account for that?

## Block Content

When `Marmdown` splits the document into lines, it keeps the line endings
(`\r`, `\n` or `\r\n`) with those lines. So, even though `GenericBlockParser`
gets all those lines one-by-one, at the end, they form a continuous block of
text. Every block parser must recognize those continuous blocks of text and
store them accordingly:

```
+-----+        +------------------------+        +-------+
| GB1 | -----> | GB1 Continuous Block 1 | --+--> | GB1L1 |
+-----+        +------------------------+   |    +-------+
                                            |
                                            |    +-------+
                                            +--> | GB1L2 |
                                            |    +-------+
                                            |
                                            |    +-------+
                                            +--> | GB1L3 |
                                            |    +-------+
                                            |
                                            |    +-------+
                                            +--> | GB1L4 |
                                                 +-------+
```

But the lines here cannot only contain the text of the contained line. They
must know how the lines were created from smaller content blocks.

```
+-------+        +-------------+
| GB1L1 | --+--> | TextContent |
+-------+   |    | "> "        |
            |    +-------------+
            |
            |    +------+        +-----------------------+        +----+
            +--> | P1L1 | <----- | P1 Continuous Block 1 | <--+-- | P1 |
            |    +------+        +-----------------------+    |   +----+
            |                                                 |
            |    +--------------+                             |
            +--> | Text Content |                             |
                 | "\n"         |                             |
                 +--------------+                             |
                                                              |
+-------+        +-------------+                              |
| GB1L2 | --+--> | TextContent |                              |
+-------+   |    | "> "        |                              |
            |    +-------------+                              |
            |                                                 |
            |    +------+        +-----------------------+    |
            +--> | P1L2 | <----- | P1 Continuous Block 2 | <--+
            |    +------+        +-----------------------+
            |
            |    +--------------+
            +--> | Text Content |
                 | "\n"         |
                 +--------------+
```

So, the two lines of the first paragraph are referenced from the first two
lines of the generic block, but they are alos part of the first paragraph `P1`
(in two separate continuous blocks).

The paragraph lines do not contain the `\n` characters. So, every block must
be able to handle lines that are terminated by a _line ending_ and also lines
where that _line ending_ is missing.

## Inline Content

A paragraph line can contain inline content. While the first line of the first
paragraph contains only text content, the second line contains some **bold** text.

```
+------+        +------------------------+
| P1L1 | -----> | Text Content           |
+------+        | "The first paragraph," |
                +------------------------+

+------+        +--------------+
| P1L2 | --+--> | Text Content |
+------+   |    | "spanning "  |
           |    +--------------+
           |
           |    +--------------+        +-------------+
           +--> | Bold Content | -----> | TextContent |
           |    +--------------+        | "two"       |
           |                            +-------------+
           |
           |    +--------------+
           +--> | Text Content |
                | " lines"     |
                +--------------+
```

`Text Content` and `Bold Content`, in this picture, are of type inline content.
The parser must differentiate between container inline content and leaf
inline content.

Next, see how this data structure is created during
[non-copying parsing]{@tutorial non-copying-parsing} and supports
[parsing updates]{@tutorial parsing-updates.md}.
