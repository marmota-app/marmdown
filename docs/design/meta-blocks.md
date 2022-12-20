# Blocks and Meta-Blocks

Some blocks also create meta blocks, e.g.

* A heading starts a section that continues until a heading with the same
  or higher priority is found, or until the end of the document
* The first list item of an ordered or unordered list starts a "list" meta
  block, all other items are part of that meta block
* etc.

## Meta Blocks and Line-by-Line parsing

Since documents are parsed line-by-line and since every parser first tries
to continue the last known element before getting into general parsing mode,
the parser of an element that also starts a meta block can return that meta
block.

For example, here is a part of a document that contains a heading, which will
start a meta block. The outer parser is an [`MfMContainerParser`]{@link MfMContainerParser}.

```
102 ...
103 # Heading Starting a Meta Block  
104 This heading has two lines
105
106 Some paragraph content in that meta block.
107 
108 Another paragraph.
109 
110 # Next Meta Block
111 ...
```

Before getting to line 103, the container parser has the active element
`section n-1`, where the active element is `container.content[container.content.length-1]`
(the last entry of the container's content).

Now, the container parser sees line 103. It tries to parse it with the previous parser,
which is a [`MfMSectionParser`]{@link MfMSectionParser} for level 1. This
parser recognizes the start of a new section (the level-1-heading) and
refuses to add the line to the current section (it returns null).

So, the container parser will ask all known parsers to parse line 103, and
the heading parser will respond. But it does not return a heading, it returns
a section. It also makes sure that the section has a reference to the correct
parser in its parsedWith field. The document structure is now, at this point:

```
MfMContainer parseWith: containerParser
+--- ...
\--- MfMSection level: 1, parsedWith: sectionParser
     \--- MfMHeading level: 1, parsedWith: headingParser
          \--- MfMText parseWith: textParser, text: Heading starting a Meta Block
```

The active (= last) element in the container is now `section n`. The container
encounters line 104. It passes it on to the section parser of `section n`,
which passes it on to the parser of the heading.

This parser recognizes that the previous line ended with two spaces, so it
adds the text to the current heading.

Then, from line 105 on, two paragraphs are parsed and `section n` is ended
just like above when the parser encounters the next heading of level 1.
