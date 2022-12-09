* **document**: The parsed representation of a markdown document. A tree
  structure of JavaScript objects.
* **text**, **original text**: The text content a _document_ was based on,
* **element**: a part of the document. Might be _block_ or _inline_ content.
* **options**: can add metadata to any other _element_. Consists of _option_
  elements. Written inside curly braces.
* **option**: a single key=value pair or a _default option_.
* **default option**: the first option in an _options_ block can specify only 
  a value. In that case, the key is "default".
* **block**: an _element_ of the document that can contain other _elements_
* **container block**: a _block_ of the document that can only contain other
  _blocks_
* **meta container**: a container that has no directly corresponding text in 
  the document, e.g. the "list" is a meta-container that is created by the
  first list item.
* **leaf block**: a _block_ of the document that can only contain _inline_
  content
* **inline**: an _element_ of the document that is part of the content of a
  _leaf block_
* **container inline**: an _inline_ element that can contain text and other
  inline elements
* **leaf inline**: an _inline_ _element_ that can only contain text or nothing
* **parser**: a class that can create an _element_ from a piece of text
  (or multiple pieces of text)
