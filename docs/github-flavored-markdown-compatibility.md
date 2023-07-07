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
* Example 26: Indentation after the first line of a paragraph is not yet removed correctly;  
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
* Example 36: Escaping is not yet implemented;  
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
## 4.10 NOT yet Implemented
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
## 5.3 NOT yet Implemented
## 5.4 NOT yet Implemented
## 6.1 NOT yet Implemented
## 6.2 NOT yet Implemented
## 6.3 NOT yet Implemented
## 6.4 Emphasis and strong emphasis - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 362: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  a*"foo"*
  
  ```
  Expected HTML:
  ```html
  <p>a*&quot;foo&quot;*</p>
  
  ```
* Example 368: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  a_"foo"_
  
  ```
  Expected HTML:
  ```html
  <p>a_&quot;foo&quot;_</p>
  
  ```
* Example 372: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  aa_"bb"_cc
  
  ```
  Expected HTML:
  ```html
  <p>aa_&quot;bb&quot;_cc</p>
  
  ```
* Example 389: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  a**"foo"**
  
  ```
  Expected HTML:
  ```html
  <p>a**&quot;foo&quot;**</p>
  
  ```
* Example 394: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  a__"foo"__
  
  ```
  Expected HTML:
  ```html
  <p>a__&quot;foo&quot;__</p>
  
  ```
* INCOMPATIBLE - Example 403: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  **Gomphocarpus (*Gomphocarpus physocarpus*, syn.
  *Asclepias physocarpa*)**
  
  ```
  Expected HTML:
  ```html
  <p><strong>Gomphocarpus (<em>Gomphocarpus physocarpus</em>, syn.
  <em>Asclepias physocarpa</em>)</strong></p>
  
  ```
* Example 404: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  **foo "*bar*" foo**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>
  
  ```
* Example 413: Links are not yet implemented;  
  Markdown input:
  ```markdown
  *foo [bar](/url)*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <a href="/url">bar</a></em></p>
  
  ```
* INCOMPATIBLE - Example 414: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  *foo
  bar*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo
  bar</em></p>
  
  ```
* INCOMPATIBLE - Example 417: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  __foo_ bar_
  
  ```
  Expected HTML:
  ```html
  <p><em><em>foo</em> bar</em></p>
  
  ```
* INCOMPATIBLE - Example 420: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  *foo**bar**baz*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<strong>bar</strong>baz</em></p>
  
  ```
* INCOMPATIBLE - Example 421: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  *foo**bar*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo**bar</em></p>
  
  ```
* INCOMPATIBLE - Example 424: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  *foo**bar***
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<strong>bar</strong></em></p>
  
  ```
* Example 428: Links are not yet implemented;  
  Markdown input:
  ```markdown
  *foo [*bar*](/url)*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <a href="/url"><em>bar</em></a></em></p>
  
  ```
* Example 431: Links are not yet implemented;  
  Markdown input:
  ```markdown
  **foo [bar](/url)**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <a href="/url">bar</a></strong></p>
  
  ```
* INCOMPATIBLE - Example 432: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  **foo
  bar**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo
  bar</strong></p>
  
  ```
* INCOMPATIBLE - Example 439: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  ***foo* bar**
  
  ```
  Expected HTML:
  ```html
  <p><strong><em>foo</em> bar</strong></p>
  
  ```
* INCOMPATIBLE - Example 441: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  **foo *bar **baz**
  bim* bop**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <em>bar <strong>baz</strong>
  bim</em> bop</strong></p>
  
  ```
* Example 442: Links are not yet implemented;  
  Markdown input:
  ```markdown
  **foo [*bar*](/url)**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <a href="/url"><em>bar</em></a></strong></p>
  
  ```
* Example 446: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  foo *\**
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>*</em></p>
  
  ```
* Example 449: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  foo **\***
  
  ```
  Expected HTML:
  ```html
  <p>foo <strong>*</strong></p>
  
  ```
* INCOMPATIBLE - Example 451: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  **foo*
  
  ```
  Expected HTML:
  ```html
  <p>*<em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 454: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  ****foo*
  
  ```
  Expected HTML:
  ```html
  <p>***<em>foo</em></p>
  
  ```
* Example 458: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  foo _\__
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>_</em></p>
  
  ```
* Example 461: Escaping is not yet implemented;  
  Markdown input:
  ```markdown
  foo __\___
  
  ```
  Expected HTML:
  ```html
  <p>foo <strong>_</strong></p>
  
  ```
* INCOMPATIBLE - Example 463: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  __foo_
  
  ```
  Expected HTML:
  ```html
  <p>_<em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 466: In MfM, delimiters are matched left-to-right, not inside-out;  
  Markdown input:
  ```markdown
  ____foo_
  
  ```
  Expected HTML:
  ```html
  <p>___<em>foo</em></p>
  
  ```
* Example 482: Links are not yet implemented;  
  Markdown input:
  ```markdown
  *[bar*](/url)
  
  ```
  Expected HTML:
  ```html
  <p>*<a href="/url">bar*</a></p>
  
  ```
* Example 483: Links are not yet implemented;  
  Markdown input:
  ```markdown
  _foo [bar_](/url)
  
  ```
  Expected HTML:
  ```html
  <p>_foo <a href="/url">bar_</a></p>
  
  ```
* INCOMPATIBLE - Example 484: HTML content is not supported;  
  Markdown input:
  ```markdown
  *<img src="foo" title="*"/>
  
  ```
  Expected HTML:
  ```html
  <p>*<img src="foo" title="*"/></p>
  
  ```
* INCOMPATIBLE - Example 485: HTML content is not supported;  
  Markdown input:
  ```markdown
  **<a href="**">
  
  ```
  Expected HTML:
  ```html
  <p>**<a href="**"></p>
  
  ```
* INCOMPATIBLE - Example 486: HTML content is not supported;  
  Markdown input:
  ```markdown
  __<a href="__">
  
  ```
  Expected HTML:
  ```html
  <p>__<a href="__"></p>
  
  ```
* Example 487: Inline code elements are not yet implemented;  
  Markdown input:
  ```markdown
  *a `*`*
  
  ```
  Expected HTML:
  ```html
  <p><em>a <code>*</code></em></p>
  
  ```
* Example 488: Inline code elements are not yet implemented;  
  Markdown input:
  ```markdown
  _a `_`_
  
  ```
  Expected HTML:
  ```html
  <p><em>a <code>_</code></em></p>
  
  ```
* INCOMPATIBLE - Example 489: HTML content is not supported;  
  Markdown input:
  ```markdown
  **a<http://foo.bar/?q=**>
  
  ```
  Expected HTML:
  ```html
  <p>**a<a href="http://foo.bar/?q=**">http://foo.bar/?q=**</a></p>
  
  ```
* INCOMPATIBLE - Example 490: HTML content is not supported;  
  Markdown input:
  ```markdown
  __a<http://foo.bar/?q=__>
  
  ```
  Expected HTML:
  ```html
  <p>__a<a href="http://foo.bar/?q=__">http://foo.bar/?q=__</a></p>
  
  ```
## 6.5 Strikethrough (extension) - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 493: In MfM, strike-through behaves like other emphasis, allowing multiple, nested elements;  
  Markdown input:
  ```markdown
  This will ~~~not~~~ strike.
  
  ```
  Expected HTML:
  ```html
  <p>This will ~~~not~~~ strike.</p>
  
  ```
## 6.6 NOT yet Implemented
## 6.7 NOT yet Implemented
## 6.8 NOT yet Implemented
## 6.9 NOT yet Implemented
## 6.10 NOT yet Implemented
## 6.11 NOT yet Implemented
## 6.12 Hard line breaks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 661: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
  foo  
       bar
  
  ```
  Expected HTML:
  ```html
  <p>foo<br />
  bar</p>
  
  ```
* Example 662: Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
  foo\
       bar
  
  ```
  Expected HTML:
  ```html
  <p>foo<br />
  bar</p>
  
  ```
* INCOMPATIBLE - Example 663: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  *foo  
  bar*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<br />
  bar</em></p>
  
  ```
* INCOMPATIBLE - Example 664: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  *foo\
  bar*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<br />
  bar</em></p>
  
  ```
* Example 665: Inline code elements are not yet implemented;  
  Markdown input:
  ```markdown
  `code  
  span`
  
  ```
  Expected HTML:
  ```html
  <p><code>code   span</code></p>
  
  ```
* Example 666: Inline code elements are not yet implemented;  
  Markdown input:
  ```markdown
  `code\
  span`
  
  ```
  Expected HTML:
  ```html
  <p><code>code\ span</code></p>
  
  ```
* INCOMPATIBLE - Example 667: HTML content is not supported;  
  Markdown input:
  ```markdown
  <a href="foo  
  bar">
  
  ```
  Expected HTML:
  ```html
  <p><a href="foo  
  bar"></p>
  
  ```
* INCOMPATIBLE - Example 668: HTML content is not supported;  
  Markdown input:
  ```markdown
  <a href="foo\
  bar">
  
  ```
  Expected HTML:
  ```html
  <p><a href="foo\
  bar"></p>
  
  ```
* INCOMPATIBLE - Example 669: In MfM, hard line breaks are always added, even at the end of a block;  
  Markdown input:
  ```markdown
  foo\
  
  ```
  Expected HTML:
  ```html
  <p>foo\</p>
  
  ```
* INCOMPATIBLE - Example 670: In MfM, hard line breaks are always added, even at the end of a block;  
  Markdown input:
  ```markdown
  foo  
  
  ```
  Expected HTML:
  ```html
  <p>foo</p>
  
  ```
* INCOMPATIBLE - Example 671: In MfM, hard line breaks are always added, even at the end of a block;  
  Markdown input:
  ```markdown
  ### foo\
  
  ```
  Expected HTML:
  ```html
  <h3>foo\</h3>
  
  ```
## 6.13 Soft line breaks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 674: In MfM, spaces are usually not removed at the end of a line/Leading spaces are not yet removed correctly;  
  Markdown input:
  ```markdown
  foo 
   baz
  
  ```
  Expected HTML:
  ```html
  <p>foo
  baz</p>
  
  ```
## 6.14 NOT yet Implemented