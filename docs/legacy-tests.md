# Legacy Tests

This parser is **not** a drop-in replacement for the legacy parser that
was implemented directly in [marmota.app](https://marmota.app/). So, this
parser does strive to be API-compatible.

**But** this parser must support the same use cases as the old parser, so
that we can re-implement all the current functionality of marmota.app with
the data structures from this parser. To ensure that, we added the tests
from the legacy parser to the folder

```
test/integration/legacy
```

Since this new parser is not API-compatible (and was not completely implemented
at the time we copied the tests), we started out by skipping all the tests
and commenting out the content.

Now we had to re-write the tests one-by-one so that they match the original
intent but work with the new code and APIs.