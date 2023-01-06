# Non-Copying Parsing

The first, hacked-together parser of [marmota.app](https://marmota.app)
created **a lot** of temporary string objects that were only used
during parsing and discarded later.

It's bad performance even caused a small performance problem (input lag) with
large presentations, but that could be mitigated by rendering the preview
asynchronously. So, it did not cause any **real** performance problem with
all presentations I tested.

But it is still a pretty messy implementation. So, the new implementation
should only copy text when it's absolutely necessary.

## General Implementation

Almost every object in the parsed tree should operate on three values: The
original `text` (a reference to the complete document test), the `start`
index and the `length` of the content. This allows every element to share
the same text object&mdash;at least after a full document parse (see below
how updates are parsed).

But there is an exception to this rule: A few elements can also hold a copy
of the text content. An element representing some plain text (like {@link MfMText})
can expect it's text content to be read at least once, probably more often.
So, it can cache a copy of the **actual** text content, which is a substring
of the original `text`.

## Parsing Updates

TK decide when starting to implement