# Line Content of Container Blocks

Container blocks should derive their line content dynamically form their
content, and **not** store an array of lines themselves. e.g. the MfMContainer
below contains two paragraphs and two empty lines in between (ignoring the
MfMSection that would normally also be part of the container). It can
derive its line content directly from the inner content:

```
container -> paragraph -> The quick brown <- p1 line 1
        |                 fox jumps over  <- p1 line 2
        |                 the lazy dog    <- p1 line 3
        + -> empty ----->                 <- empty line 1
        |                                 <- empty line 2
        \-> paragraph ->  Sphinx of       <- p2 line 1
                          black quartz    <- p2 line 2
                          judge my vow.   <- p2 line 3
```

From this inner content&mdash;the two paragraphs and the empty lines&mdash;the
container can derive its line content instead of storing it directly.

But it can become more complicated than that...

## Complication: Options and Content

In the following example, the document options and the paragraph share the
second line.

```
{ default option; key1=value1
key2=value2} The quick brown fox
jumps over the lazy dog.
```

In such a case, the container block must be able to only dynamically create
one content line at this boundary.

## Complication: Prefix Content

Here, the block quote contains a paragraph, but each line of the paragraph
must be prefixed with a ">" and a different number of whitespace.

```
>The quick
>   brown fox
>	jumps over
> the lazy dog
```

The container block (blockquote or "general-purpose block" in this case)
must be able to store and retrieve the correct prefix for each line here.

It also must have a default prefix, in case there is no stored prefix for
a line yet. This will enable software that builds on marmdown to dynamically
add and remove content from container blocks.

## Solution: Line IDs

Each "real" parsed line&mdash;that is, each parsed line that was not dynamically
created as described above&mdash;gets a unique ID.

A container block can now store content that belongs to a line, like the
prefix for block content or whether the line will be continued after the
current element, based on that ID.

All dynamically created lines from the container blocks share the same line
ID with the original line they are based on:

* The line IDs only have to be unique within a container, but can be shared
  on different levels of the tree
* We do not need to think about a way of determining line IDs for dynamically
  created lines
* It can help find out which lines "belong together"

## Another Complication: Lines without Content

Consider the line

```
>
```

That is, an empty line of a block. There is no content that could be parsed
here. So, there is no content line which this line could be based on!

In the picture above, those lines were marked `empty`:

```
container -> paragraph -> The quick brown <- p1 line 1
        |                 fox jumps over  <- p1 line 2
        |                 the lazy dog    <- p1 line 3
        + -> empty ----->                 <- empty line 1
        |                                 <- empty line 2
        \-> paragraph ->  Sphinx of       <- p2 line 1
                          black quartz    <- p2 line 2
                          judge my vow.   <- p2 line 3
```

Our **solution** to this problem is to add an `Empty` element to a block when
no content could be parsed.

## Is it Bad that Lines are Always Created Dynamically?

During normal operation, the array of lines should be accessed only occasionally
for a container block: A container block can only occur within another container
block, and those do not need their line content for their normal operation.

That is, those other container blocks do not access their line content to
determine their content, as a leaf block would do.

So, the `lines` array of a container block is only ever needed when we want
to re-create the text of the document, which is not an operation that markdown
parsers or editors should perform very often.
