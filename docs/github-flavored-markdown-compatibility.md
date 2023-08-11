# Markdown compatibility

## 1.1 What is GitHub Flavored Markdown? - Implemented
## 1.2 What is Markdown? - Implemented
## 1.3 Why is a spec needed? - Implemented
## 1.4 About this document - Implemented
## 2.1 Characters and lines - Implemented
## 2.2 Tabs - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 1: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
  	foo	baz		bim
  
  ```
  Expected HTML:
  ```html
  <pre><code>foo	baz		bim
  </code></pre>
  
  ```
* Example 2: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
    	foo	baz		bim
  
  ```
  Expected HTML:
  ```html
  <pre><code>foo	baz		bim
  </code></pre>
  
  ```
* Example 3: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      a	a
      ὐ	a
  
  ```
  Expected HTML:
  ```html
  <pre><code>a	a
  ὐ	a
  </code></pre>
  
  ```
* INCOMPATIBLE - Example 4: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
    - foo
  
  	bar
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>
  <p>foo</p>
  <p>bar</p>
  </li>
  </ul>
  
  ```
* INCOMPATIBLE - Example 5: Laziness clause (https://github.github.com/gfm/#paragraph-continuation-text) is not implemented;  
  Markdown input:
  ```markdown
  - foo
  
  		bar
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>
  <p>foo</p>
  <pre><code>  bar
  </code></pre>
  </li>
  </ul>
  
  ```
* INCOMPATIBLE - Example 6: MfM never expands tabs, not even after the list character or block character;  
  Markdown input:
  ```markdown
  >		foo
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <pre><code>  foo
  </code></pre>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 7: MfM never expands tabs, not even after the list character or block character;  
  Markdown input:
  ```markdown
  -		foo
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>
  <pre><code>  foo
  </code></pre>
  </li>
  </ul>
  
  ```
* Example 8: Indented code blocks are not yet implemented;  
  Markdown input:
  ```markdown
      foo
  	bar
  
  ```
  Expected HTML:
  ```html
  <pre><code>foo
  bar
  </code></pre>
  
  ```
* Example 9: Lists are not yet implemented;  
  Markdown input:
  ```markdown
   - foo
     - bar
  	 - baz
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>foo
  <ul>
  <li>bar
  <ul>
  <li>baz</li>
  </ul>
  </li>
  </ul>
  </li>
  </ul>
  
  ```
## 2.3 Insecure Characters - Incompatible! - Implemented
## 3.1 NOT yet Implemented
## 3.2 Container blocks and leaf blocks - Implemented
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

* Example 35: Escaping special characters is not yet implemented;  
  Markdown input:
  ```markdown
  \## foo
  
  ```
  Expected HTML:
  ```html
  <p>## foo</p>
  
  ```
* Example 36: Escaping special characters is not yet implemented;  
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
* Example 46: Escaping special characters is not yet implemented;  
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
## 4.3 Setext headings - Incompatible! - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 50: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo *bar*
  =========
  
  Foo *bar*
  ---------
  
  ```
  Expected HTML:
  ```html
  <h1>Foo <em>bar</em></h1>
  <h2>Foo <em>bar</em></h2>
  
  ```
* INCOMPATIBLE - Example 51: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo *bar
  baz*
  ====
  
  ```
  Expected HTML:
  ```html
  <h1>Foo <em>bar
  baz</em></h1>
  
  ```
* INCOMPATIBLE - Example 52: Setext headings are not supported;  
  Markdown input:
  ```markdown
    Foo *bar
  baz*	
  ====
  
  ```
  Expected HTML:
  ```html
  <h1>Foo <em>bar
  baz</em></h1>
  
  ```
* INCOMPATIBLE - Example 53: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  -------------------------
  
  Foo
  =
  
  ```
  Expected HTML:
  ```html
  <h2>Foo</h2>
  <h1>Foo</h1>
  
  ```
* INCOMPATIBLE - Example 54: Setext headings are not supported;  
  Markdown input:
  ```markdown
     Foo
  ---
  
    Foo
  -----
  
    Foo
    ===
  
  ```
  Expected HTML:
  ```html
  <h2>Foo</h2>
  <h2>Foo</h2>
  <h1>Foo</h1>
  
  ```
* INCOMPATIBLE - Example 55: Setext headings are not supported;  
  Markdown input:
  ```markdown
      Foo
      ---
  
      Foo
  ---
  
  ```
  Expected HTML:
  ```html
  <pre><code>Foo
  ---
  
  Foo
  </code></pre>
  <hr />
  
  ```
* INCOMPATIBLE - Example 56: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
     ----      
  
  ```
  Expected HTML:
  ```html
  <h2>Foo</h2>
  
  ```
* INCOMPATIBLE - Example 57: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
      ---
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  ---</p>
  
  ```
* INCOMPATIBLE - Example 58: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  = =
  
  Foo
  --- -
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  = =</p>
  <p>Foo</p>
  <hr />
  
  ```
* INCOMPATIBLE - Example 59: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo  
  -----
  
  ```
  Expected HTML:
  ```html
  <h2>Foo</h2>
  
  ```
* INCOMPATIBLE - Example 60: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo\
  ----
  
  ```
  Expected HTML:
  ```html
  <h2>Foo\</h2>
  
  ```
* INCOMPATIBLE - Example 61: Setext headings are not supported;  
  Markdown input:
  ```markdown
  `Foo
  ----
  `
  
  <a title="a lot
  ---
  of dashes"/>
  
  ```
  Expected HTML:
  ```html
  <h2>`Foo</h2>
  <p>`</p>
  <h2>&lt;a title=&quot;a lot</h2>
  <p>of dashes&quot;/&gt;</p>
  
  ```
* INCOMPATIBLE - Example 62: Setext headings are not supported;  
  Markdown input:
  ```markdown
  > Foo
  ---
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>Foo</p>
  </blockquote>
  <hr />
  
  ```
* INCOMPATIBLE - Example 63: Setext headings are not supported;  
  Markdown input:
  ```markdown
  > foo
  bar
  ===
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>foo
  bar
  ===</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 64: Setext headings are not supported;  
  Markdown input:
  ```markdown
  - Foo
  ---
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>Foo</li>
  </ul>
  <hr />
  
  ```
* INCOMPATIBLE - Example 65: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  Bar
  ---
  
  ```
  Expected HTML:
  ```html
  <h2>Foo
  Bar</h2>
  
  ```
* INCOMPATIBLE - Example 66: Setext headings are not supported;  
  Markdown input:
  ```markdown
  ---
  Foo
  ---
  Bar
  ---
  Baz
  
  ```
  Expected HTML:
  ```html
  <hr />
  <h2>Foo</h2>
  <h2>Bar</h2>
  <p>Baz</p>
  
  ```
* INCOMPATIBLE - Example 67: Setext headings are not supported;  
  Markdown input:
  ```markdown
  
  ====
  
  ```
  Expected HTML:
  ```html
  <p>====</p>
  
  ```
* INCOMPATIBLE - Example 68: Setext headings are not supported;  
  Markdown input:
  ```markdown
  ---
  ---
  
  ```
  Expected HTML:
  ```html
  <hr />
  <hr />
  
  ```
* INCOMPATIBLE - Example 69: Setext headings are not supported;  
  Markdown input:
  ```markdown
  - foo
  -----
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>foo</li>
  </ul>
  <hr />
  
  ```
* INCOMPATIBLE - Example 70: Setext headings are not supported;  
  Markdown input:
  ```markdown
      foo
  ---
  
  ```
  Expected HTML:
  ```html
  <pre><code>foo
  </code></pre>
  <hr />
  
  ```
* INCOMPATIBLE - Example 71: Setext headings are not supported;  
  Markdown input:
  ```markdown
  > foo
  -----
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <p>foo</p>
  </blockquote>
  <hr />
  
  ```
* INCOMPATIBLE - Example 72: Setext headings are not supported;  
  Markdown input:
  ```markdown
  \> foo
  ------
  
  ```
  Expected HTML:
  ```html
  <h2>&gt; foo</h2>
  
  ```
* INCOMPATIBLE - Example 73: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  
  bar
  ---
  baz
  
  ```
  Expected HTML:
  ```html
  <p>Foo</p>
  <h2>bar</h2>
  <p>baz</p>
  
  ```
* INCOMPATIBLE - Example 74: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  bar
  
  ---
  
  baz
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  bar</p>
  <hr />
  <p>baz</p>
  
  ```
* INCOMPATIBLE - Example 75: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  bar
  * * *
  baz
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  bar</p>
  <hr />
  <p>baz</p>
  
  ```
* INCOMPATIBLE - Example 76: Setext headings are not supported;  
  Markdown input:
  ```markdown
  Foo
  bar
  \---
  baz
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  bar
  ---
  baz</p>
  
  ```
## 4.4 Indented code blocks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 78: Lists are not yet implemented;  
  Markdown input:
  ```markdown
    - foo
  
      bar
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>
  <p>foo</p>
  <p>bar</p>
  </li>
  </ul>
  
  ```
* Example 79: Lists are not yet implemented;  
  Markdown input:
  ```markdown
  1.  foo
  
      - bar
  
  ```
  Expected HTML:
  ```html
  <ol>
  <li>
  <p>foo</p>
  <ul>
  <li>bar</li>
  </ul>
  </li>
  </ol>
  
  ```
* Example 83: Indentation after the first line of a paragraph is not yet removed correctly;  
  Markdown input:
  ```markdown
  Foo
      bar
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  bar</p>
  
  ```
* INCOMPATIBLE - Example 85: Setext headings are not supported;  
  Markdown input:
  ```markdown
  # Heading
      foo
  Heading
  ------
      foo
  ----
  
  ```
  Expected HTML:
  ```html
  <h1>Heading</h1>
  <pre><code>foo
  </code></pre>
  <h2>Heading</h2>
  <pre><code>foo
  </code></pre>
  <hr />
  
  ```
## 4.5 Fenced code blocks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 91: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  ``
  foo
  ``
  
  ```
  Expected HTML:
  ```html
  <p><code>foo</code></p>
  
  ```
* INCOMPATIBLE - Example 111: Setext headings are not supported;  
  Markdown input:
  ```markdown
  foo
  ---
  ~~~
  bar
  ~~~
  # baz
  
  ```
  Expected HTML:
  ```html
  <h2>foo</h2>
  <pre><code>bar
  </code></pre>
  <h1>baz</h1>
  
  ```
## 4.6 HTML blocks - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 118: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <table><tr><td>
  <pre>
  **Hello**,
  
  _world_.
  </pre>
  </td></tr></table>
  
  ```
  Expected HTML:
  ```html
  <table><tr><td>
  <pre>
  **Hello**,
  <p><em>world</em>.
  </pre></p>
  </td></tr></table>
  
  ```
* INCOMPATIBLE - Example 119: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <table>
    <tr>
      <td>
             hi
      </td>
    </tr>
  </table>
  
  okay.
  
  ```
  Expected HTML:
  ```html
  <table>
    <tr>
      <td>
             hi
      </td>
    </tr>
  </table>
  <p>okay.</p>
  
  ```
* INCOMPATIBLE - Example 120: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
   <div>
    *hello*
           <foo><a>
  
  ```
  Expected HTML:
  ```html
   <div>
    *hello*
           <foo><a>
  
  ```
* INCOMPATIBLE - Example 121: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  </div>
  *foo*
  
  ```
  Expected HTML:
  ```html
  </div>
  *foo*
  
  ```
* INCOMPATIBLE - Example 122: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <DIV CLASS="foo">
  
  *Markdown*
  
  </DIV>
  
  ```
  Expected HTML:
  ```html
  <DIV CLASS="foo">
  <p><em>Markdown</em></p>
  </DIV>
  
  ```
* INCOMPATIBLE - Example 123: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div id="foo"
    class="bar">
  </div>
  
  ```
  Expected HTML:
  ```html
  <div id="foo"
    class="bar">
  </div>
  
  ```
* INCOMPATIBLE - Example 124: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div id="foo" class="bar
    baz">
  </div>
  
  ```
  Expected HTML:
  ```html
  <div id="foo" class="bar
    baz">
  </div>
  
  ```
* INCOMPATIBLE - Example 125: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div>
  *foo*
  
  *bar*
  
  ```
  Expected HTML:
  ```html
  <div>
  *foo*
  <p><em>bar</em></p>
  
  ```
* INCOMPATIBLE - Example 126: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div id="foo"
  *hi*
  
  ```
  Expected HTML:
  ```html
  <div id="foo"
  *hi*
  
  ```
* INCOMPATIBLE - Example 127: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div class
  foo
  
  ```
  Expected HTML:
  ```html
  <div class
  foo
  
  ```
* INCOMPATIBLE - Example 128: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div *???-&&&-<---
  *foo*
  
  ```
  Expected HTML:
  ```html
  <div *???-&&&-<---
  *foo*
  
  ```
* INCOMPATIBLE - Example 129: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div><a href="bar">*foo*</a></div>
  
  ```
  Expected HTML:
  ```html
  <div><a href="bar">*foo*</a></div>
  
  ```
* INCOMPATIBLE - Example 130: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <table><tr><td>
  foo
  </td></tr></table>
  
  ```
  Expected HTML:
  ```html
  <table><tr><td>
  foo
  </td></tr></table>
  
  ```
* INCOMPATIBLE - Example 131: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div></div>
  ``` c
  int x = 33;
  ```
  
  ```
  Expected HTML:
  ```html
  <div></div>
  ``` c
  int x = 33;
  ```
  
  ```
* INCOMPATIBLE - Example 132: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a href="foo">
  *bar*
  </a>
  
  ```
  Expected HTML:
  ```html
  <a href="foo">
  *bar*
  </a>
  
  ```
* INCOMPATIBLE - Example 133: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <Warning>
  *bar*
  </Warning>
  
  ```
  Expected HTML:
  ```html
  <Warning>
  *bar*
  </Warning>
  
  ```
* INCOMPATIBLE - Example 134: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <i class="foo">
  *bar*
  </i>
  
  ```
  Expected HTML:
  ```html
  <i class="foo">
  *bar*
  </i>
  
  ```
* INCOMPATIBLE - Example 135: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  </ins>
  *bar*
  
  ```
  Expected HTML:
  ```html
  </ins>
  *bar*
  
  ```
* INCOMPATIBLE - Example 136: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <del>
  *foo*
  </del>
  
  ```
  Expected HTML:
  ```html
  <del>
  *foo*
  </del>
  
  ```
* INCOMPATIBLE - Example 137: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <del>
  
  *foo*
  
  </del>
  
  ```
  Expected HTML:
  ```html
  <del>
  <p><em>foo</em></p>
  </del>
  
  ```
* INCOMPATIBLE - Example 138: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <del>*foo*</del>
  
  ```
  Expected HTML:
  ```html
  <p><del><em>foo</em></del></p>
  
  ```
* INCOMPATIBLE - Example 139: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <pre language="haskell"><code>
  import Text.HTML.TagSoup
  
  main :: IO ()
  main = print $ parseTags tags
  </code></pre>
  okay
  
  ```
  Expected HTML:
  ```html
  <pre language="haskell"><code>
  import Text.HTML.TagSoup
  
  main :: IO ()
  main = print $ parseTags tags
  </code></pre>
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 140: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <script type="text/javascript">
  // JavaScript example
  
  document.getElementById("demo").innerHTML = "Hello JavaScript!";
  </script>
  okay
  
  ```
  Expected HTML:
  ```html
  <script type="text/javascript">
  // JavaScript example
  
  document.getElementById("demo").innerHTML = "Hello JavaScript!";
  </script>
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 141: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <style
    type="text/css">
  h1 {color:red;}
  
  p {color:blue;}
  </style>
  okay
  
  ```
  Expected HTML:
  ```html
  <style
    type="text/css">
  h1 {color:red;}
  
  p {color:blue;}
  </style>
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 142: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <style
    type="text/css">
  
  foo
  
  ```
  Expected HTML:
  ```html
  <style
    type="text/css">
  
  foo
  
  ```
* INCOMPATIBLE - Example 143: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  > <div>
  > foo
  
  bar
  
  ```
  Expected HTML:
  ```html
  <blockquote>
  <div>
  foo
  </blockquote>
  <p>bar</p>
  
  ```
* INCOMPATIBLE - Example 144: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  - <div>
  - foo
  
  ```
  Expected HTML:
  ```html
  <ul>
  <li>
  <div>
  </li>
  <li>foo</li>
  </ul>
  
  ```
* INCOMPATIBLE - Example 145: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <style>p{color:red;}</style>
  *foo*
  
  ```
  Expected HTML:
  ```html
  <style>p{color:red;}</style>
  <p><em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 146: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <!-- foo -->*bar*
  *baz*
  
  ```
  Expected HTML:
  ```html
  <!-- foo -->*bar*
  <p><em>baz</em></p>
  
  ```
* INCOMPATIBLE - Example 147: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <script>
  foo
  </script>1. *bar*
  
  ```
  Expected HTML:
  ```html
  <script>
  foo
  </script>1. *bar*
  
  ```
* INCOMPATIBLE - Example 148: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <!-- Foo
  
  bar
     baz -->
  okay
  
  ```
  Expected HTML:
  ```html
  <!-- Foo
  
  bar
     baz -->
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 149: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <?php
  
    echo '>';
  
  ?>
  okay
  
  ```
  Expected HTML:
  ```html
  <?php
  
    echo '>';
  
  ?>
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 150: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <!DOCTYPE html>
  
  ```
  Expected HTML:
  ```html
  <!DOCTYPE html>
  
  ```
* INCOMPATIBLE - Example 151: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <![CDATA[
  function matchwo(a,b)
  {
    if (a < b && a < 0) then {
      return 1;
  
    } else {
  
      return 0;
    }
  }
  ]]>
  okay
  
  ```
  Expected HTML:
  ```html
  <![CDATA[
  function matchwo(a,b)
  {
    if (a < b && a < 0) then {
      return 1;
  
    } else {
  
      return 0;
    }
  }
  ]]>
  <p>okay</p>
  
  ```
* INCOMPATIBLE - Example 152: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
    <!-- foo -->
  
      <!-- foo -->
  
  ```
  Expected HTML:
  ```html
    <!-- foo -->
  <pre><code>&lt;!-- foo --&gt;
  </code></pre>
  
  ```
* INCOMPATIBLE - Example 153: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
    <div>
  
      <div>
  
  ```
  Expected HTML:
  ```html
    <div>
  <pre><code>&lt;div&gt;
  </code></pre>
  
  ```
* INCOMPATIBLE - Example 154: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  Foo
  <div>
  bar
  </div>
  
  ```
  Expected HTML:
  ```html
  <p>Foo</p>
  <div>
  bar
  </div>
  
  ```
* INCOMPATIBLE - Example 155: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div>
  bar
  </div>
  *foo*
  
  ```
  Expected HTML:
  ```html
  <div>
  bar
  </div>
  *foo*
  
  ```
* INCOMPATIBLE - Example 156: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  Foo
  <a href="bar">
  baz
  
  ```
  Expected HTML:
  ```html
  <p>Foo
  <a href="bar">
  baz</p>
  
  ```
* INCOMPATIBLE - Example 157: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div>
  
  *Emphasized* text.
  
  </div>
  
  ```
  Expected HTML:
  ```html
  <div>
  <p><em>Emphasized</em> text.</p>
  </div>
  
  ```
* INCOMPATIBLE - Example 158: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <div>
  *Emphasized* text.
  </div>
  
  ```
  Expected HTML:
  ```html
  <div>
  *Emphasized* text.
  </div>
  
  ```
* INCOMPATIBLE - Example 159: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <table>
  
  <tr>
  
  <td>
  Hi
  </td>
  
  </tr>
  
  </table>
  
  ```
  Expected HTML:
  ```html
  <table>
  <tr>
  <td>
  Hi
  </td>
  </tr>
  </table>
  
  ```
* INCOMPATIBLE - Example 160: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <table>
  
    <tr>
  
      <td>
        Hi
      </td>
  
    </tr>
  
  </table>
  
  ```
  Expected HTML:
  ```html
  <table>
    <tr>
  <pre><code>&lt;td&gt;
    Hi
  &lt;/td&gt;
  </code></pre>
    </tr>
  </table>
  
  ```
## 4.7 Link reference definitions - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 162: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
     [foo]: 
        /url  
             'the title'  
  
  [foo]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url" title="the title">foo</a></p>
  
  ```
* INCOMPATIBLE - Example 163: MfM does not allow unescaped parenthesis in link destinations, even when they are balanced;  
  Markdown input:
  ```markdown
  [Foo*bar\]]:my_(url) 'title (with parens)'
  
  [Foo*bar\]]
  
  ```
  Expected HTML:
  ```html
  <p><a href="my_(url)" title="title (with parens)">Foo*bar]</a></p>
  
  ```
* INCOMPATIBLE - Example 164: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [Foo bar]:
  <my url>
  'title'
  
  [Foo bar]
  
  ```
  Expected HTML:
  ```html
  <p><a href="my%20url" title="title">Foo bar</a></p>
  
  ```
* INCOMPATIBLE - Example 165: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [foo]: /url '
  title
  line1
  line2
  '
  
  [foo]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url" title="
  title
  line1
  line2
  ">foo</a></p>
  
  ```
* INCOMPATIBLE - Example 167: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [foo]:
  /url
  
  [foo]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url">foo</a></p>
  
  ```
* INCOMPATIBLE - Example 170: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  [foo]: <bar>(baz)
  
  [foo]
  
  ```
  Expected HTML:
  ```html
  <p>[foo]: <bar>(baz)</p>
  <p>[foo]</p>
  
  ```
* INCOMPATIBLE - Example 171: In MfM, all backslashes must be escaped, even if they would be unambiguous in GfM;  
  Markdown input:
  ```markdown
  [foo]: /url\bar\*baz "foo\"bar\baz"
  
  [foo]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url%5Cbar*baz" title="foo&quot;bar\baz">foo</a></p>
  
  ```
* INCOMPATIBLE - Example 177: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [
  foo
  ]: /url
  bar
  
  ```
  Expected HTML:
  ```html
  <p>bar</p>
  
  ```
* Example 183: Links in headings are not yet implemented;  
  Markdown input:
  ```markdown
  # [Foo]
  [foo]: /url
  > bar
  
  ```
  Expected HTML:
  ```html
  <h1><a href="/url">Foo</a></h1>
  <blockquote>
  <p>bar</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 184: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [foo]: /url
  bar
  ===
  [foo]
  
  ```
  Expected HTML:
  ```html
  <h1>bar</h1>
  <p><a href="/url">foo</a></p>
  
  ```
* INCOMPATIBLE - Example 186: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [foo]: /foo-url "foo"
  [bar]: /bar-url
    "bar"
  [baz]: /baz-url
  
  [foo],
  [bar],
  [baz]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/foo-url" title="foo">foo</a>,
  <a href="/bar-url" title="bar">bar</a>,
  <a href="/baz-url">baz</a></p>
  
  ```
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
## 4.9 Blank lines - Implemented
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
## 6.3 Code spans - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 345: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  ``
  foo
  bar  
  baz
  ``
  
  ```
  Expected HTML:
  ```html
  <p><code>foo bar   baz</code></p>
  
  ```
* INCOMPATIBLE - Example 346: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  ``
  foo 
  ``
  
  ```
  Expected HTML:
  ```html
  <p><code>foo </code></p>
  
  ```
* INCOMPATIBLE - Example 347: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  `foo   bar 
  baz`
  
  ```
  Expected HTML:
  ```html
  <p><code>foo   bar  baz</code></p>
  
  ```
* INCOMPATIBLE - Example 353: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  `<a href="`">`
  
  ```
  Expected HTML:
  ```html
  <p><code>&lt;a href=&quot;</code>&quot;&gt;`</p>
  
  ```
* INCOMPATIBLE - Example 354: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a href="`">`
  
  ```
  Expected HTML:
  ```html
  <p><a href="`">`</p>
  
  ```
* INCOMPATIBLE - Example 355: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  `<http://foo.bar.`baz>`
  
  ```
  Expected HTML:
  ```html
  <p><code>&lt;http://foo.bar.</code>baz&gt;`</p>
  
  ```
* INCOMPATIBLE - Example 356: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <http://foo.bar.`baz>`
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://foo.bar.%60baz">http://foo.bar.`baz</a>`</p>
  
  ```
## 6.4 Emphasis and strong emphasis - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

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
* Example 446: Escaping special characters is not yet implemented;  
  Markdown input:
  ```markdown
  foo *\**
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>*</em></p>
  
  ```
* Example 449: Escaping special characters is not yet implemented;  
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
* Example 458: Escaping special characters is not yet implemented;  
  Markdown input:
  ```markdown
  foo _\__
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>_</em></p>
  
  ```
* Example 461: Escaping special characters is not yet implemented;  
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
* INCOMPATIBLE - Example 484: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  *<img src="foo" title="*"/>
  
  ```
  Expected HTML:
  ```html
  <p>*<img src="foo" title="*"/></p>
  
  ```
* INCOMPATIBLE - Example 485: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  **<a href="**">
  
  ```
  Expected HTML:
  ```html
  <p>**<a href="**"></p>
  
  ```
* INCOMPATIBLE - Example 486: HTML content is not supported in MfM;  
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
* INCOMPATIBLE - Example 489: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  **a<http://foo.bar/?q=**>
  
  ```
  Expected HTML:
  ```html
  <p>**a<a href="http://foo.bar/?q=**">http://foo.bar/?q=**</a></p>
  
  ```
* INCOMPATIBLE - Example 490: HTML content is not supported in MfM;  
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
## 6.6 Links - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 501: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  [link](<foo
  bar>)
  
  ```
  Expected HTML:
  ```html
  <p>[link](<foo
  bar>)</p>
  
  ```
* INCOMPATIBLE - Example 504: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  [a](<b)c
  [a](<b)c>
  [a](<b>c)
  
  ```
  Expected HTML:
  ```html
  <p>[a](&lt;b)c
  [a](&lt;b)c&gt;
  [a](<b>c)</p>
  
  ```
* INCOMPATIBLE - Example 506: MfM does not allow unescaped parenthesis in link destinations, even when they are balanced;  
  Markdown input:
  ```markdown
  [link](foo(and(bar)))
  
  ```
  Expected HTML:
  ```html
  <p><a href="foo(and(bar))">link</a></p>
  
  ```
* INCOMPATIBLE - Example 511: In MfM, all backslashes must be escaped, even if they would be unambiguous in GfM;  
  Markdown input:
  ```markdown
  [link](foo\bar)
  
  ```
  Expected HTML:
  ```html
  <p><a href="foo%5Cbar">link</a></p>
  
  ```
* Example 512: Entity references are not yet fully supported;  
  Markdown input:
  ```markdown
  [link](foo%20b&auml;)
  
  ```
  Expected HTML:
  ```html
  <p><a href="foo%20b%C3%A4">link</a></p>
  
  ```
* INCOMPATIBLE - Example 513: MfM never tries to parse quoted strings as destinations;  
  Markdown input:
  ```markdown
  [link]("title")
  
  ```
  Expected HTML:
  ```html
  <p><a href="%22title%22">link</a></p>
  
  ```
* Example 515: Entity references are not yet fully supported;  
  Markdown input:
  ```markdown
  [link](/url "title \"&quot;")
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url" title="title &quot;&quot;">link</a></p>
  
  ```
* INCOMPATIBLE - Example 516: MfM treats all whitespace equally for links;  
  Markdown input:
  ```markdown
  [link](/url "title")
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url%C2%A0%22title%22">link</a></p>
  
  ```
* INCOMPATIBLE - Example 519: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  [link](   /uri
    "title"  )
  
  ```
  Expected HTML:
  ```html
  <p><a href="/uri" title="title">link</a></p>
  
  ```
* INCOMPATIBLE - Example 527: In MfM, links can contain other links;  
  Markdown input:
  ```markdown
  [foo [bar](/uri)](/uri)
  
  ```
  Expected HTML:
  ```html
  <p>[foo <a href="/uri">bar</a>](/uri)</p>
  
  ```
* INCOMPATIBLE - Example 528: In MfM, links can contain other links;  
  Markdown input:
  ```markdown
  [foo *[bar [baz](/uri)](/uri)*](/uri)
  
  ```
  Expected HTML:
  ```html
  <p>[foo <em>[bar <a href="/uri">baz</a>](/uri)</em>](/uri)</p>
  
  ```
* INCOMPATIBLE - Example 529: In MfM, links can contain other links;  
  Markdown input:
  ```markdown
  ![[[foo](uri1)](uri2)](uri3)
  
  ```
  Expected HTML:
  ```html
  <p><img src="uri3" alt="[foo](uri2)" /></p>
  
  ```
* INCOMPATIBLE - Example 532: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  *foo [bar* baz]
  
  ```
  Expected HTML:
  ```html
  <p><em>foo [bar</em> baz]</p>
  
  ```
* INCOMPATIBLE - Example 533: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  [foo <bar attr="](baz)">
  
  ```
  Expected HTML:
  ```html
  <p>[foo <bar attr="](baz)"></p>
  
  ```
* Example 535: Autolinks <in angle brackets> are not yet implemented;  
  Markdown input:
  ```markdown
  [foo<http://example.com/?search=](uri)>
  
  ```
  Expected HTML:
  ```html
  <p>[foo<a href="http://example.com/?search=%5D(uri)">http://example.com/?search=](uri)</a></p>
  
  ```
* INCOMPATIBLE - Example 541: In MfM, links can contain other links;  
  Markdown input:
  ```markdown
  [foo [bar](/uri)][ref]
  
  [ref]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[foo <a href="/uri">bar</a>]<a href="/uri">ref</a></p>
  
  ```
* INCOMPATIBLE - Example 542: In MfM, links can contain other links;  
  Markdown input:
  ```markdown
  [foo *bar [baz][ref]*][ref]
  
  [ref]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[foo <em>bar <a href="/uri">baz</a></em>]<a href="/uri">ref</a></p>
  
  ```
* INCOMPATIBLE - Example 545: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  [foo <bar attr="][ref]">
  
  [ref]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[foo <bar attr="][ref]"></p>
  
  ```
* Example 547: Autolinks <in angle brackets> are not yet implemented;  
  Markdown input:
  ```markdown
  [foo<http://example.com/?search=][ref]>
  
  [ref]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[foo<a href="http://example.com/?search=%5D%5Bref%5D">http://example.com/?search=][ref]</a></p>
  
  ```
* INCOMPATIBLE - Example 549: MfM does not use unicode case fold;  
  Markdown input:
  ```markdown
  [ẞ]
  
  [SS]: /url
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url">ẞ</a></p>
  
  ```
* INCOMPATIBLE - Example 550: MfM does not support multiline link references;  
  Markdown input:
  ```markdown
  [Foo
    bar]: /url
  
  [Baz][Foo bar]
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url">Baz</a></p>
  
  ```
* INCOMPATIBLE - Example 556: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [foo][ref[bar]]
  
  [ref[bar]]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[foo][ref[bar]]</p>
  <p>[ref[bar]]: /uri</p>
  
  ```
* INCOMPATIBLE - Example 557: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [[[foo]]]
  
  [[[foo]]]: /url
  
  ```
  Expected HTML:
  ```html
  <p>[[[foo]]]</p>
  <p>[[[foo]]]: /url</p>
  
  ```
* INCOMPATIBLE - Example 561: MfM does not support multi-line inline content;  
  Markdown input:
  ```markdown
  [
   ]
  
  [
   ]: /uri
  
  ```
  Expected HTML:
  ```html
  <p>[
  ]</p>
  <p>[
  ]: /uri</p>
  
  ```
* INCOMPATIBLE - Example 565: MfM preserves whitespace at the end of the line, which the test does not expect.;  
  Markdown input:
  ```markdown
  [foo] 
  []
  
  [foo]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url" title="title">foo</a>
  []</p>
  
  ```
* INCOMPATIBLE - Example 568: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [[*foo* bar]]
  
  [*foo* bar]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p>[<a href="/url" title="title"><em>foo</em> bar</a>]</p>
  
  ```
* INCOMPATIBLE - Example 577: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [foo](not a link)
  
  [foo]: /url1
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url1">foo</a>(not a link)</p>
  
  ```
* INCOMPATIBLE - Example 578: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [foo][bar][baz]
  
  [baz]: /url
  
  ```
  Expected HTML:
  ```html
  <p>[foo]<a href="/url">bar</a></p>
  
  ```
* INCOMPATIBLE - Example 579: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [foo][bar][baz]
  
  [baz]: /url1
  [bar]: /url2
  
  ```
  Expected HTML:
  ```html
  <p><a href="/url2">foo</a><a href="/url1">baz</a></p>
  
  ```
* INCOMPATIBLE - Example 580: In MfM, links are always parsed completely from left to right, regardless of whether a reference is defined or not;  
  Markdown input:
  ```markdown
  [foo][bar][baz]
  
  [baz]: /url1
  [foo]: /url2
  
  ```
  Expected HTML:
  ```html
  <p>[foo]<a href="/url1">bar</a></p>
  
  ```
## 6.7 Images - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 582: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![foo *bar*]
  
  [foo *bar*]: train.jpg "train & tracks"
  
  ```
  Expected HTML:
  ```html
  <p><img src="train.jpg" alt="foo bar" title="train &amp; tracks" /></p>
  
  ```
* INCOMPATIBLE - Example 583: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![foo ![bar](/url)](/url2)
  
  ```
  Expected HTML:
  ```html
  <p><img src="/url2" alt="foo bar" /></p>
  
  ```
* INCOMPATIBLE - Example 584: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![foo [bar](/url)](/url2)
  
  ```
  Expected HTML:
  ```html
  <p><img src="/url2" alt="foo bar" /></p>
  
  ```
* INCOMPATIBLE - Example 585: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![foo *bar*][]
  
  [foo *bar*]: train.jpg "train & tracks"
  
  ```
  Expected HTML:
  ```html
  <p><img src="train.jpg" alt="foo bar" title="train &amp; tracks" /></p>
  
  ```
* INCOMPATIBLE - Example 586: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![foo *bar*][foobar]
  
  [FOOBAR]: train.jpg "train & tracks"
  
  ```
  Expected HTML:
  ```html
  <p><img src="train.jpg" alt="foo bar" title="train &amp; tracks" /></p>
  
  ```
* INCOMPATIBLE - Example 594: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![*foo* bar][]
  
  [*foo* bar]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p><img src="/url" alt="foo bar" title="title" /></p>
  
  ```
* INCOMPATIBLE - Example 596: MfM preserves whitespace at the end of the line, which the test does not expect.;  
  Markdown input:
  ```markdown
  ![foo] 
  []
  
  [foo]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p><img src="/url" alt="foo" title="title" />
  []</p>
  
  ```
* INCOMPATIBLE - Example 598: In MfM, alt text is not re-processed just for the sake of the test;  
  Markdown input:
  ```markdown
  ![*foo* bar]
  
  [*foo* bar]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p><img src="/url" alt="foo bar" title="title" /></p>
  
  ```
* INCOMPATIBLE - Example 599: In MfM, labels can contain brackets;  
  Markdown input:
  ```markdown
  ![[foo]]
  
  [[foo]]: /url "title"
  
  ```
  Expected HTML:
  ```html
  <p>![[foo]]</p>
  <p>[[foo]]: /url &quot;title&quot;</p>
  
  ```
## 6.8 NOT yet Implemented
## 6.9 Autolinks (extension) - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 622: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  www.commonmark.org
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://www.commonmark.org">www.commonmark.org</a></p>
  
  ```
* INCOMPATIBLE - Example 623: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  Visit www.commonmark.org/help for more information.
  
  ```
  Expected HTML:
  ```html
  <p>Visit <a href="http://www.commonmark.org/help">www.commonmark.org/help</a> for more information.</p>
  
  ```
* INCOMPATIBLE - Example 624: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  Visit www.commonmark.org.
  
  Visit www.commonmark.org/a.b.
  
  ```
  Expected HTML:
  ```html
  <p>Visit <a href="http://www.commonmark.org">www.commonmark.org</a>.</p>
  <p>Visit <a href="http://www.commonmark.org/a.b">www.commonmark.org/a.b</a>.</p>
  
  ```
* INCOMPATIBLE - Example 625: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  www.google.com/search?q=Markup+(business)
  
  www.google.com/search?q=Markup+(business)))
  
  (www.google.com/search?q=Markup+(business))
  
  (www.google.com/search?q=Markup+(business)
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a></p>
  <p><a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a>))</p>
  <p>(<a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a>)</p>
  <p>(<a href="http://www.google.com/search?q=Markup+(business)">www.google.com/search?q=Markup+(business)</a></p>
  
  ```
* INCOMPATIBLE - Example 626: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  www.google.com/search?q=(business))+ok
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://www.google.com/search?q=(business))+ok">www.google.com/search?q=(business))+ok</a></p>
  
  ```
* INCOMPATIBLE - Example 627: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  www.google.com/search?q=commonmark&hl=en
  
  www.google.com/search?q=commonmark&hl;
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://www.google.com/search?q=commonmark&amp;hl=en">www.google.com/search?q=commonmark&amp;hl=en</a></p>
  <p><a href="http://www.google.com/search?q=commonmark">www.google.com/search?q=commonmark</a>&amp;hl;</p>
  
  ```
* INCOMPATIBLE - Example 628: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  www.commonmark.org/he<lp
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://www.commonmark.org/he">www.commonmark.org/he</a>&lt;lp</p>
  
  ```
* INCOMPATIBLE - Example 629: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  http://commonmark.org
  
  (Visit https://encrypted.google.com/search?q=Markup+(business))
  
  ```
  Expected HTML:
  ```html
  <p><a href="http://commonmark.org">http://commonmark.org</a></p>
  <p>(Visit <a href="https://encrypted.google.com/search?q=Markup+(business)">https://encrypted.google.com/search?q=Markup+(business)</a>)</p>
  
  ```
* INCOMPATIBLE - Example 630: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  foo@bar.baz
  
  ```
  Expected HTML:
  ```html
  <p><a href="mailto:foo@bar.baz">foo@bar.baz</a></p>
  
  ```
* INCOMPATIBLE - Example 631: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  hello@mail+xyz.example isn't valid, but hello+xyz@mail.example is.
  
  ```
  Expected HTML:
  ```html
  <p>hello@mail+xyz.example isn't valid, but <a href="mailto:hello+xyz@mail.example">hello+xyz@mail.example</a> is.</p>
  
  ```
* INCOMPATIBLE - Example 632: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  a.b-c_d@a.b
  
  a.b-c_d@a.b.
  
  a.b-c_d@a.b-
  
  a.b-c_d@a.b_
  
  ```
  Expected HTML:
  ```html
  <p><a href="mailto:a.b-c_d@a.b">a.b-c_d@a.b</a></p>
  <p><a href="mailto:a.b-c_d@a.b">a.b-c_d@a.b</a>.</p>
  <p>a.b-c_d@a.b-</p>
  <p>a.b-c_d@a.b_</p>
  
  ```
* INCOMPATIBLE - Example 633: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  mailto:foo@bar.baz
  
  mailto:a.b-c_d@a.b
  
  mailto:a.b-c_d@a.b.
  
  mailto:a.b-c_d@a.b/
  
  mailto:a.b-c_d@a.b-
  
  mailto:a.b-c_d@a.b_
  
  xmpp:foo@bar.baz
  
  xmpp:foo@bar.baz.
  
  ```
  Expected HTML:
  ```html
  <p><a href="mailto:foo@bar.baz">mailto:foo@bar.baz</a></p>
  <p><a href="mailto:a.b-c_d@a.b">mailto:a.b-c_d@a.b</a></p>
  <p><a href="mailto:a.b-c_d@a.b">mailto:a.b-c_d@a.b</a>.</p>
  <p><a href="mailto:a.b-c_d@a.b">mailto:a.b-c_d@a.b</a>/</p>
  <p>mailto:a.b-c_d@a.b-</p>
  <p>mailto:a.b-c_d@a.b_</p>
  <p><a href="xmpp:foo@bar.baz">xmpp:foo@bar.baz</a></p>
  <p><a href="xmpp:foo@bar.baz">xmpp:foo@bar.baz</a>.</p>
  
  ```
* INCOMPATIBLE - Example 634: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  xmpp:foo@bar.baz/txt
  
  xmpp:foo@bar.baz/txt@bin
  
  xmpp:foo@bar.baz/txt@bin.com
  
  ```
  Expected HTML:
  ```html
  <p><a href="xmpp:foo@bar.baz/txt">xmpp:foo@bar.baz/txt</a></p>
  <p><a href="xmpp:foo@bar.baz/txt@bin">xmpp:foo@bar.baz/txt@bin</a></p>
  <p><a href="xmpp:foo@bar.baz/txt@bin.com">xmpp:foo@bar.baz/txt@bin.com</a></p>
  
  ```
* INCOMPATIBLE - Example 635: MfM does not support the autolinks extension, which tries to recognize links in plain text;  
  Markdown input:
  ```markdown
  xmpp:foo@bar.baz/txt/bin
  
  ```
  Expected HTML:
  ```html
  <p><a href="xmpp:foo@bar.baz/txt">xmpp:foo@bar.baz/txt</a>/bin</p>
  
  ```
## 6.10 Raw HTML - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 636: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a><bab><c2c>
  
  ```
  Expected HTML:
  ```html
  <p><a><bab><c2c></p>
  
  ```
* INCOMPATIBLE - Example 637: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a/><b2/>
  
  ```
  Expected HTML:
  ```html
  <p><a/><b2/></p>
  
  ```
* INCOMPATIBLE - Example 638: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a  /><b2
  data="foo" >
  
  ```
  Expected HTML:
  ```html
  <p><a  /><b2
  data="foo" ></p>
  
  ```
* INCOMPATIBLE - Example 639: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a foo="bar" bam = 'baz <em>"</em>'
  _boolean zoop:33=zoop:33 />
  
  ```
  Expected HTML:
  ```html
  <p><a foo="bar" bam = 'baz <em>"</em>'
  _boolean zoop:33=zoop:33 /></p>
  
  ```
* INCOMPATIBLE - Example 640: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  Foo <responsive-image src="foo.jpg" />
  
  ```
  Expected HTML:
  ```html
  <p>Foo <responsive-image src="foo.jpg" /></p>
  
  ```
* INCOMPATIBLE - Example 641: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <33> <__>
  
  ```
  Expected HTML:
  ```html
  <p>&lt;33&gt; &lt;__&gt;</p>
  
  ```
* INCOMPATIBLE - Example 642: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a h*#ref="hi">
  
  ```
  Expected HTML:
  ```html
  <p>&lt;a h*#ref=&quot;hi&quot;&gt;</p>
  
  ```
* INCOMPATIBLE - Example 643: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a href="hi'> <a href=hi'>
  
  ```
  Expected HTML:
  ```html
  <p>&lt;a href=&quot;hi'&gt; &lt;a href=hi'&gt;</p>
  
  ```
* INCOMPATIBLE - Example 644: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  < a><
  foo><bar/ >
  <foo bar=baz
  bim!bop />
  
  ```
  Expected HTML:
  ```html
  <p>&lt; a&gt;&lt;
  foo&gt;&lt;bar/ &gt;
  &lt;foo bar=baz
  bim!bop /&gt;</p>
  
  ```
* INCOMPATIBLE - Example 645: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a href='bar'title=title>
  
  ```
  Expected HTML:
  ```html
  <p>&lt;a href='bar'title=title&gt;</p>
  
  ```
* INCOMPATIBLE - Example 646: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  </a></foo >
  
  ```
  Expected HTML:
  ```html
  <p></a></foo ></p>
  
  ```
* INCOMPATIBLE - Example 647: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  </a href="foo">
  
  ```
  Expected HTML:
  ```html
  <p>&lt;/a href=&quot;foo&quot;&gt;</p>
  
  ```
* INCOMPATIBLE - Example 648: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <!-- this is a
  comment - with hyphen -->
  
  ```
  Expected HTML:
  ```html
  <p>foo <!-- this is a
  comment - with hyphen --></p>
  
  ```
* INCOMPATIBLE - Example 649: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <!-- not a comment -- two hyphens -->
  
  ```
  Expected HTML:
  ```html
  <p>foo &lt;!-- not a comment -- two hyphens --&gt;</p>
  
  ```
* INCOMPATIBLE - Example 650: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <!--> foo -->
  
  foo <!-- foo--->
  
  ```
  Expected HTML:
  ```html
  <p>foo &lt;!--&gt; foo --&gt;</p>
  <p>foo &lt;!-- foo---&gt;</p>
  
  ```
* INCOMPATIBLE - Example 651: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <?php echo $a; ?>
  
  ```
  Expected HTML:
  ```html
  <p>foo <?php echo $a; ?></p>
  
  ```
* INCOMPATIBLE - Example 652: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <!ELEMENT br EMPTY>
  
  ```
  Expected HTML:
  ```html
  <p>foo <!ELEMENT br EMPTY></p>
  
  ```
* INCOMPATIBLE - Example 653: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <![CDATA[>&<]]>
  
  ```
  Expected HTML:
  ```html
  <p>foo <![CDATA[>&<]]></p>
  
  ```
* INCOMPATIBLE - Example 654: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <a href="&ouml;">
  
  ```
  Expected HTML:
  ```html
  <p>foo <a href="&ouml;"></p>
  
  ```
* INCOMPATIBLE - Example 655: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  foo <a href="\*">
  
  ```
  Expected HTML:
  ```html
  <p>foo <a href="\*"></p>
  
  ```
* INCOMPATIBLE - Example 656: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <a href="\"">
  
  ```
  Expected HTML:
  ```html
  <p>&lt;a href=&quot;&quot;&quot;&gt;</p>
  
  ```
## 6.11 Disallowed Raw HTML (extension) - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* INCOMPATIBLE - Example 657: HTML content is not supported in MfM;  
  Markdown input:
  ```markdown
  <strong> <title> <style> <em>
  
  <blockquote>
    <xmp> is disallowed.  <XMP> is also disallowed.
  </blockquote>
  
  ```
  Expected HTML:
  ```html
  <p><strong> &lt;title> &lt;style> <em></p>
  <blockquote>
    &lt;xmp> is disallowed.  &lt;XMP> is also disallowed.
  </blockquote>
  
  ```
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
* INCOMPATIBLE - Example 667: HTML content is not supported in MfM;  
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
* INCOMPATIBLE - Example 668: HTML content is not supported in MfM;  
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
## 6.14 Textual content - Implemented