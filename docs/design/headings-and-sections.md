# Headings and Sections

Every heading creates a section, where a section is a container block that
contains all the content until the next heading of the same type or until
the end of the document.

```
# The Heading

A Paragraph

* A List
```

The above document creates the following structure:

```
section level=1
+--- heading: 'The Heading'
+--- paragraph: 'A Paragraph'
\--- unordered list
     \--- list item
          \--- paragraph: 'A List'
```

Every section has a level that corresponds to the heading level of the
heading that started the section. A heading with a higher level creates
a new section inside the current one, a heading with equal or lower level
ends the current section and creates a new one next to it:

```
# First Heading
## Second Heading
### Third Heading
### Fourth Heading
# Fifth Heading
```

...creates the following structure:

```
section level=1
+--- heading: 'First Heading'
\--- section level=2
     +--- heading: 'Second Heading'
     +--- section level=3
     |    \--- heading: 'Third Heading'
     \--- section level=3
          \--- heading: 'Fourth Heading'
section level=1
\--- heading: 'Fifth Heading'
```

A marmdown document **always** consists of sections with level one. So,
even when the document does not start with a level-one-heading, a section
with level one is created.
