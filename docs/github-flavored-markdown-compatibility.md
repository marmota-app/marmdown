# Markdown compatibility

## 1.1 What is GitHub Flavored Markdown? - Implemented
## 1.2 What is Markdown? - Implemented
## 1.3 Why is a spec needed? - Implemented
## 1.4 About this document - Implemented
## 2.1 Characters and lines - Implemented
## 2.2 NOT yet Implemented
## 2.3 NOT yet Implemented
## 3.1 NOT yet Implemented
## 3.2 NOT yet Implemented
## 4.1 Thematic breaks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 18: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      ***
  
  ```
  Expected HTML:
  ```html
  <pre><code>***
  </code></pre>
  
  ```
* Example 19: Indentation after the first line of a paragraph is not yet removed correctly;  
  Markdown input:
  ```markdown
  Foo
      ***
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  ***</p>
  
  ```
* Example 26: Emphasis is not yet implemented;  
  Markdown input:
  ```markdown
   *-*
  
  ```
  Expected HTML:
  ```html
  <p><em>-</em></p>
  
  ```
* Example 27: Lists are not yet implemented;  
  Markdown input:
  ```markdown
  - foo
  ***
  - bar
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>foo</li>
  </ul>
  <hr />
  <ul>
  <li>bar</li>
  </ul>
  
  ```
* INCOMPATIBLE - Example 29: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  ---
  bar
  
  ```
  Expected HTML:
  ```html
  <h2>Foo</h2>
  <p>bar</p>
  
  ```
* Example 30: Lists are not yet implemented;  
  Markdown input:
  ```markdown
  * Foo
  * * *
  * Bar
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>Foo</li>
  </ul>
  <hr />
  <ul>
  <li>Bar</li>
  </ul>
  
  ```
* Example 31: Lists are not yet implemented;  
  Markdown input:
  ```markdown
  - Foo
  - * * *
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>Foo</li>
  <li>
  <hr />
  </li>
  </ul>
  
  ```
## 4.2 ATX headings - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 35: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  \## foo
  
  ```
  Expected HTML:
  ```html
  <p>## foo</p>
  
  ```
* Example 36: Emphasis is not yet implemented, Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  # foo *bar* \*baz\*
  
  ```
  Expected HTML:
  ```html
  <h1>foo <em>bar</em> *baz*</h1>
  
  ```
* Example 37: Leading & trailing whitespace for headings is not yet removed;  
  Markdown input:
  ```markdown
  #                  foo                     
  
  ```
  Expected HTML:
  ```html
  <h1>foo</h1>
  
  ```
* Example 38: Indentation for headings is not yet supported;  
  Markdown input:
  ```markdown
   ### foo
    ## foo
     # foo
  
  ```
  Expected HTML:
  ```html
  <h3>foo</h3>
  <h2>foo</h2>
  <h1>foo</h1>
  
  ```
* Example 39: Fenced code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      # foo
  
  ```
  Expected HTML:
  ```html
  <pre><code># foo
  </code></pre>
  
  ```
* Example 40: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
  foo
      # bar
  
  ```
  Expected HTML:
  ```html
  <p>foo
  # bar</p>
  
  ```
* Example 41: Optional closing sequences are not yet supported;  
  Markdown input:
  ```markdown
  ## foo ##
    ###   bar    ###
  
  ```
  Expected HTML:
  ```html
  <h2>foo</h2>
  <h3>bar</h3>
  
  ```
* Example 42: Optional closing sequences are not yet supported;  
  Markdown input:
  ```markdown
  # foo ##################################
  ##### foo ##
  
  ```
  Expected HTML:
  ```html
  <h1>foo</h1>
  <h5>foo</h5>
  
  ```
* Example 43: Optional closing sequences are not yet supported;  
  Markdown input:
  ```markdown
  ### foo ###     
  
  ```
  Expected HTML:
  ```html
  <h3>foo</h3>
  
  ```
* Example 46: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  ### foo \###
  ## foo #\##
  # foo \#
  
  ```
  Expected HTML:
  ```html
  <h3>foo ###</h3>
  <h2>foo ###</h2>
  <h1>foo #</h1>
  
  ```
* Example 49: Optional closing sequences are not yet supported;  
  Markdown input:
  ```markdown
  ## 
  #
  ### ###
  
  ```
  Expected HTML:
  ```html
  <h2></h2>
  <h1></h1>
  <h3></h3>
  
  ```
## 4.3 NOT yet Implemented
## 4.4 NOT yet Implemented
## 4.5 NOT yet Implemented
## 4.6 NOT yet Implemented
## 4.7 NOT yet Implemented
## 4.8 Paragraphs - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 192: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
    aaa
   bbb
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb</p>
  
  ```
* Example 193: Indentation after the first line of a paragraph is not yet removed correctly;  
  Markdown input:
  ```markdown
  aaa
               bbb
                                         ccc
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb
  ccc</p>
  
  ```
* Example 194: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
     aaa
  bbb
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb</p>
  
  ```
* Example 195: Fenced code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      aaa
  bbb
  
  ```
  Expected HTML:
  ```html
  <pre><code>aaa
  </code></pre>
  <p>bbb</p>
  
  ```
* Example 196: Hard line breaks (<br/>) are not yet implemented;  
  Markdown input:
  ```markdown
  aaa     
  bbb     
  
  ```
  Expected HTML:
  ```html
  <p>aaa<br />
  bbb</p>
  
  ```
## 4.9 NOT yet Implemented
## 5.1 Block quotes - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 208: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
     > # Foo
     > bar
   > baz
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <h1>Foo</h1>
  <p>bar
  baz</p>
  </blockquote>
  
  ```
* Example 209: Fenced code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      > # Foo
      > bar
      > baz
  
  ```
  Expected HTML:
  ```html
  <pre><code>&gt; # Foo
  &gt; bar
  &gt; baz
  </code></pre>
  
  ```
* INCOMPATIBLE - Example 210: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > # Foo
  > bar
  baz
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <h1>Foo</h1>
  <p>bar
  baz</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 211: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > bar
  baz
  > foo
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>bar
  baz
  foo</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 212: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > foo
  ---
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>foo</p>
  </blockquote>
  <hr />
  
  ```
* INCOMPATIBLE - Example 213: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > - foo
  - bar
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <ul>
  <li>foo</li>
  </ul>
  </blockquote>
  <ul>
  <li>bar</li>
  </ul>
  
  ```
* INCOMPATIBLE - Example 214: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  >     foo
      bar
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <pre><code>foo
  </code></pre>
  </blockquote>
  <pre><code>bar
  </code></pre>
  
  ```
* INCOMPATIBLE - Example 215: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > ```
  foo
  ```
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <pre><code></code></pre>
  </blockquote>
  <p>foo</p>
  <pre><code></code></pre>
  
  ```
* INCOMPATIBLE - Example 216: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > foo
      - bar
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>foo
  - bar</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 225: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > bar
  baz
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>bar
  baz</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 228: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  > > > foo
  bar
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <blockquote>
  <blockquote>
  <p>foo
  bar</p>
  </blockquote>
  </blockquote>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 229: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  >>> foo
  > bar
  >>baz
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <blockquote>
  <blockquote>
  <p>foo
  bar
  baz</p>
  </blockquote>
  </blockquote>
  </blockquote>
  
  ```
* Example 230: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
  >     code
  
  >    not code
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <pre><code>code
  </code></pre>
  </blockquote>
  <blockquote>
  <p>not code</p>
  </blockquote>
  
  ```
## 5.2 NOT yet Implemented
## 5.4 NOT yet Implemented
## 6.1 NOT yet Implemented
## 6.2 NOT yet Implemented
## 6.3 NOT yet Implemented
## 6.4 NOT yet Implemented
## 6.6 NOT yet Implemented
## 6.7 NOT yet Implemented
## 6.8 NOT yet Implemented
## 6.10 NOT yet Implemented
## 6.12 NOT yet Implemented
## 6.13 NOT yet Implemented
## 6.14 NOT yet Implemented