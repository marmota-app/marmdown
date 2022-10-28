The "new", stateful markdown parser for [marmota.app](https://marmota.app)

## Design

This markdown parser serves two main purposes:

* Make it possible to partially parse a document: When a part of the document changes, only the smallest possible portion of the document should be re-parsed.
* Re-generate the document's text from the model: The program must be able to change the document's model and then generate the document's text from it.

Read more about the design decisions in [the Design documentation](./docs/design.md)

## Differences to GitHub Flavored Markdown

Marmota-Flavored-Markdown (MfM) tries to be mostly compatible with
[Github Flavored Markdown (GfM)](https://github.github.com/gfm), but there are
some differences.

* No [setext headings](https://github.github.com/gfm/#setext-heading)
* No [HTML blocks](https://github.github.com/gfm/#html-block)
* Thematic breaks and headlines end fenced code blocks
* Block quotes (and asides) do not support [lazyness](https://github.github.com/gfm/#block-quote-marker)

### Thematic breaks and headlines end fenced code blocks

Suppose we have the following two slides:

```markdown
# Slide 1

# Slide 2
```

When you now start a fenced code block in "Slide 1", in GfM,
the headline of "Slide 2" will become part of the code block.

```markdown
# Slide 1

~~~
# Slide 2
```

At least temporarily, until you close the fenced code block again. In GfM, this is
not a problem. But in marmota.app, this would completely change the rendering of the
preview, at least temporarily. Slides after the code block would disappear, and then
reappear again when you end the code block.

In our case, this is not the desired behavior. So, we end fenced code blocks also when
we hit a thematic break (`---`, `***` or `___`) or a headline (`# ` etc.).
