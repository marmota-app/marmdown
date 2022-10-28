# Updatable Elements and Partial Parsing

To enable partial parsing of a document, one of the two main design goals of
Marmdown, we need data structures that allow us to finde the place where we
can make a content change and then to update everything that was affected by
that content change.

Updatable elements are defined in [src/UpdatableElement.ts](../src/UpdatableElement.ts)
and the interface is defined in [src/Updatable.ts](../src/Updatable.ts).

## Element Contents

Every element that can contain other content must enable parsting that other
content line-by-line.

### The Simple Case

Consider this heading with a multi-line options block.

```markdown
#{ default-value; key1 = value1;  
  key2 = a longer value } Heading Content
A paragraph
```

#### 1. Parsing the first line

The main markdown parser (Marmdown) will try to parse all elements, passing
the first line of the document. The heading will be the first (and only) parser
to respond to this line.

Before trying to parse its own content, the heading will try to parse options,
passing the remainder of the line (`{ default-value; key1 = value1;  `) to the options
parser.

The options parser parses the options and, since this is a valid options line,
returns the result. There is nothing left for the heading parser to parse on this
line. But, so far, this is a valid heading, so the heading parser returns the
result.

#### 2. Parsing the second line

Now, the main markdown parser processes the second line. Since there is a
previous result (the heading), the toplevel parser will first try to parse the
current line with the previous parser, extending the heading result. Only when
that fails, it tries to parse the line with **all** toplevel parsers again.

In this case, it does not fail. The heading parser, seeing that the last call
to the options parser yielded a result, tries to continue parsing the options,
passing the complete second line to the options parser.

The options parser parses the remaining value and finds the end of the options
block.

Now, the heading parser has a remaining text of "` Heading Content`" and parses
that as the content of the heading. It marks the heading as "complete" - i.e.
it stores the fact that this heading cannot be continued anymore (becouse it does
not end with a double-space).

**TK add link to documentation how that fact is stored**

#### 3. Parsing the paragraph.

In the previous step, the heading was completely parsed, but the main parser
does not know that yet. So, it passes the previous result to the heading parser
again, trying to extend the previous heading.

But the heading parser knows that the heading was complete and returns `null`.

So, the main parser now tries to parse the the third line with **all** known
parsers, and eventually, the paragraph parser will respond.

### A more Complete Example

In a more complete example, like the one below, parsing a line passes the content
to multiple, different parsers.

```markdown
> a paragraph inside a block
> that has two lines
>
> #{ heading-option } Heading, still inside  
> with a second line
> 
> *{reveal=next} And a list, where each
> * list item actually contains
> * paragraph content

More paragraph content, outside of the block
```

Consider the line "`> *{reveal=next} And a list, where each`". The block parser
responds to the "`> `" at the beginning and then parses a list. The list parser
hands over to the options parser, which parses "`{reveal=next}`". And then, it
passes the rest of the line to a paragraph parser, which parses the content
"`And a list, where each`".

## Start and Length

Every line, and piece of content that was parsed inside that line, need a starting index
and a length, so that we can update them when the content was changed. We call
that updating "partial parsing".

In the example below, there are three lines. Two belong to the heading, the third
to the paragraph.

```markdown
#{ default-value; key1 = value1;  
  key2 = a longer value } Heading Content
A paragraph
```

The start and length values of the elements in the example above are:

```
 1: Heading [a]
 2: +--- Line 1: start=0, length=34
 3: |    \--- Options [b] Line 1: start=1, length=33
 4: |         +--- Option [c]: start=3, length=13
 5: |         \--- Option [d]: start=18, length=13
 6: \--- Line 2: start=35, length=41
 7:      \--- Options [b] Line 2: start=35, length=25
 8:           \--- Option [e]: start=37, length=21
 9: Paragraph [f]
10: \--- Line 3: start=77, length=11
```

### Processing a Content Change

When the content changes, the length of the current element and all parent
elements must be updated. Also, the start of all following elements must be
updated too.

If we process the content change "Insert '`the-`' at position 3", changing the
first line to "`#{ the-default-value; key1 = value1;  `", the parser can find
the affected element (the option `default-value`) using the start and lenght
values from the tree above.

Now, the following lengths must be changed (adding 3 characters):

* ` 4: |         +--- Option [c]: start=3, length=13` to **`length=16`**
* ` 3: |    \--- Options [b] Line 1: start=1, length=33` to **`length=36`**
* ` 2: +--- Line 1: start=0, length=34` to **`length=37`**

Also, the following start indices must be changed, also adding three characters:

* ` 5: |         \--- Option [d]: start=18, length=13` to **`start=21`**
* ` 6: \--- Line 2: start=35, length=41` to **`start=38`**
* ` 7:      \--- Options [b] Line 2: start=35, length=25` to **`start=38`**
* ` 8:           \--- Option [e]: start=37, length=21` to **`start=40`**
* `10: \--- Line 3: start=77, length=11` to **`start=80`**

The rest of this document describes, in more detail, how those updates can
be achieved by the partial parser and how the data structures support those
updates.

## Container, Contained and Following Elements

Every element can have contained elements, a container, and elements that come
after this element. The parser must know those when partially parsing
a document: All following elements and their children will have different starting
positions after processing the document update, and all containing elements
will have a different length, as described above.

By saving only the container and the parts on each element, we have all the information
that is needed to update the start and length values.

```markdown
#{ default-value; key1 = value1;  
  key2 = a longer value } Heading Content
A paragraph
```

The markdown document itself is the parent of all toplevel elements, and every
element in the tree structure has a reference to it's parent:

```
 1: Markdown Document [md]
 2: |--- Heading [h]
 3: |    +--- Line 1 [h-l1]: start=0, length=34, container=[md]
 4: |    |    \--- Options [h-opt]
 5: |    |         \--- Line 1 [h-opt-l1]: start=1, length=33, container=[h-l1]
 6: |    |              +--- Option [o1] Line 1: start=3, length=13, container=[h-opt-l1]
 7: |    |              \--- Option [o2] Line 1: start=18, length=13, container=[h-opt-l1]
 8: |    \--- Line 2 [h-l2]: start=35, length=41, container=[md]
 9: |         \--- Options [h-opt]
10: |              \--- Line 2 [h-opt-l2]: start=35, length=25, container=[h-l2]
11: |                   \--- Option [o3] Line 2: start=37, length=21, container=[h-opt-l2]
12: \--- Paragraph [p]
13:      \--- Line 3 [p-l3]: start=77, length=11, container=[md]
```

Note that the container is the parsed line that contains the current element, not
the logical element! i.e., the container of the first options line "h-opt-l1" is
the first line of the heading "h-l1", **not** the logical parent element "o1".

To update the starts and lengths, the partial parser must traverse the parsed
line content, **not** the logical element content.

Also, note that the "Option"s "o1", "o2" and "o3" also must logially have some
line content, even though they can never have multiline content.

## Updating Start and Length

Using the tree structure above, and the change "Insert '`the-`' at position 3"
from the previous example, the partial parser can update the values as following:

1. Partially parse "o1", updating the content to "`the-default-value`" and the length to "`16`"
1. Ask the container element, "h-opt-l1", to update the length and all elements following "o1"
    1. Update the length of "h-opt-l1" to "`36`"
    1. Update the start of "o2" to "`21`"
1. Ask the container element of "h-opt-l1", that is "h-l1", to update the length and all elements following "h-opt-l1"
    1. Update the length of "h-l1" to "`37`"
1. Ask the container element of "h-l1, that is "md", to update the length and all elements following "h-l1"
    1. Update the length of the markdown document itself
    1. Ask contained element "h-l2" to update its start index
        1. "h-l2" updates its start to "`38`"
        1. Ask contained element "h-opt-l2" to update its start index
            1. "h-opt-l2" updates its start index to "`38`"
            1. Ask contained element "o3" to update its start index
                1. "o3" updates its start index to "`40`"
    1. Ask contained element "p-l3" to update its start index
        1. "p-l3" updates its start index to "`80`"

So, with only the container and contained elements, the partial parser can
recursively update the whole tree after a content change.
