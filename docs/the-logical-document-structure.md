# The Logical Document Structure

A Marmdown document is composed of "elements", where an element could
be a heading, a paragraph, some bold text, or anything elese that could
logically belong to a document.

```markdown
#{ default-value; key1 = value1;  
  key2 = a longer value } Heading Content
A paragraph with **bold** text
```

The document above will be parsed into a data structure that looks roughly
like this:

```
 1: Document
 2: +--- Heading
 3: |    +--- Options
 4: |    |    +--- Option "default=default-value"
 5: |    |    +--- Option "key1=falue1"
 6: |    |    \--- Option "key2=a longer value"
 7: |    \--- Text Content "Heading Content"
 8: \--- Paragraph
 9:      +--- Text Content "A paragraph with"
10:      +--- Bold
11:      |    \--- Text Content "bold"
12:      \--- Text Content "text"
```

This logical document content is what programs that use this library need to
render or further process the markdown document. It is defined in
[src/MarkdownDocument.ts](../src/MarkdownDocument.ts).

But with this structure only, it would not be possible to partially parse
changes, and it would also be very hard for the parser to process deeply nested
content.

To better support that, the parser keeps additional information about the
original text document and how it was parsed, which is documented in
[Updatable Elements and Partial Parsing](./updatable-elements-partial-parsing.md).
