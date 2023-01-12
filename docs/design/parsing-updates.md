# Parsing Updates

From the chapter [blocks-of-text parsing]{@tutorial blocks-of-text-parsing}, we know
that every block can contain multiple lines, while inline content does not
contain any lines (because it cannot span multiple lines).

But a block might be based on a continuous block of text or multiple, non-continuous
blocks. We must take that into consideration when parsing updates.

## Parsing Updates and Copying Values

During a complete re-parse of the document, the [parsing and copying]{@tutorial parsing-and-copying}
makes sure that all [blocks of text]{@tutorial blocks-of-text-parsing} use the
same reference to the whole text and split the document only by remembering
the indexes of their respective content.

When a parser parses an update to a block, the content and length of that
block must change. This changes the **real** start indexes of all following
blocks, but it does **not** change the start indexes inside their reference
to the text.

The data structures for blocks take this fact into account and store two
indexes: The **real** start index (i.e. the start index inside the current
version of the text) and the start index inside the text reference of the block.

Also, when parsing an update to a block, the parser must afterwards make
sure that the start indexes of all following siblings are updated correctly.
It must also update the length of the parent block, which in turn affects
the start indexes of the following siblings of that parent block, and so
on.

## Updates that do NOT Change the Structure

Here are some test cases for updates that do **not** change the document
structure. In this case, the overall structure of the document must stay
exactly the same as it was, but the content of one of the inner elements
does change.

### Inserting / Deleting Text inside Paragraph

```
the quick brown fox\njumps over the lazy dog
          |
          insert "red-"
the quick red-brown fox\njumps over the lazy dog
```

```
the quick brown fox\njumps over the lazy dog
          |    |
          replace ""
the quick fox\njumps over the lazy dog
```

### Inserting / Deleting Text inside Bold Content

```
the **quick brown** fox\njumps over the lazy dog
            |
            insert "red-"
the **quick red-brown** fox\njumps over the lazy dog
```

```
the **quick brown** fox\njumps over the lazy dog
           |    |
           replace ""
the **quick** fox\njumps over the lazy dog
```

### Inserting / Deleting Text inside Nested Paragraph

```
> the quick brown fox\n> jumps over the lazy dog
            |
            insert "red-"
> the quick red-brown fox\n> jumps over the lazy dog
```

```
> the quick brown fox\n> jumps over the lazy dog
            |    |
            replace ""
> the quick fox\n> jumps over the lazy dog
```

### Changing Options

```
{ default-value; key=value }
                     |
                     insert "the "
{ default-value; key=the value }
```

```
{ default-value; key=value }
                 | |
                 replace "option1"
{ default-value; option1=the value }
```

## Simple Updates that DO Change the Structure

And now the test cases for updates that **do** change the document structure.
In this case, the structure of the document changes because some inner parser
was not able to completely parse the changed text. It bails out and hands
the change to it's containing content, which re-parses the whole line content
and thus can change the inner contents.

### Removing One Asterisk at Start / End of Bold

### Inserting Asterisks at Start / End of Bold

### Creating a List by Inserting Asterisk at the Start of a Line

### Removing a List by Removing a Asterisk at the Start of a Line

### Adding an Equals Sign Inside Default Option

### Removing the Equal Sign from First Option

### Merging Options

```
{ default-value; key=value }
             |  |
             replace "-"
{ default-value-key=value }
```

```
{ default-value; key=value }
             |           |
             replace ""
{ default-val }
```

### Removing the Closing Curly Brace from an Options Block

### Adding an Asterisk Between ">" and Text in a Block

### Adding an Asterisk Before the ">" of a Block

## Updates that Insert and Remove Lines

Parsing updates to the line structure is complicated: It is very hard to
design which elements of the document are affected. Consider the following
cases:

* Adding a Newline inside Bold, Making it Plain Text
* Removing a Newline Inside a Paragraph
* Adding a Newline Inside a Paragraph
* Adding a Second Newline Inside a Paragraph, Splitting the Paragraph
* Removing the Second Newline Between Paragraphs, Merging the Paragraphs
* Removing a Newline Inside a List
* Adding a Second Newline Inside a List, Splitting the List
* Removing the Second Newline Between Lists, Merging the Lists
* Adding a Second Newline to a Paragraph Inside a Block, Splitting the BLOCK
* Removing a Second Newline Between Paragraphs Inside two Blocks, Merging the BLOCKS
* Removing ">" Between Paragraphs Inside a Blocks, Merging the Paragraphs

When blocks are nested, the outer block will be affected. But in addition to
the block that processes the changes, the previous or next block could be
affected too.

Because of that, `Marmdown` **always** processes changes to the line structure
**at the toplevel [section structure]{@tutorial headings-and-sections}**, but
when simple cases at the section structure fail, it will trigger a complete
re-parse of the document. In other words, adding or deleting line breaks
always triggers a complete re-parse of either one of the toplevel sections
of the document or of the entire document.

The toplevel section structure of the document can only change in three ways:

* When a single '#' is inserted at the beginning of a line that was not
  a heading before, the current toplevel section must be split.
* When heading-level-one one to becomes normal text, because the '#' at
  the beginning is removed, two toplevel sections must be merged.
* When a heading-level-one becomes a heading-level-two, because an '#' is
  inserted.

In all three cases, a complete re-parse of the document is needed.
