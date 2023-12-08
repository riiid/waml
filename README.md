# WAML

**W**ell-defined **A**cademic **M**arkup **L**anguage
(or **W**ise**A**lpha **M**arkup **L**anguage)

- Why well-defined? - It's designed for people who don't know programming at all to edit the code itself without any extra editors.
- Why academic? - It's specialized in writing any problems to be solved by students in the education field.

## Getting Started

1. `yarn add @riiid/waml@github:riiid/waml`
1. ```js
   import { parseWAML } from "@riiid/waml";

   console.log(parseWAML("Hello, World!"));
   ```

Then the output would be:

```json
[
  {
    "kind": "Line",
    "prefixes": [],
    "component": {
      "kind": "LineComponent",
      "inlines": [
        "H",
        "e",
        "l",
        "l",
        "o",
        ",",
        " ",
        "W",
        "o",
        "r",
        "l",
        "d",
        "!"
      ]
    }
  }
]
```

We call this AST - abstract syntax tree.
You can make a custom WAML viewer from the AST.

## API

- **`parseWAML`** converts a string to a WAML document.
  You should check syntax errors like `if('error' in document){ ... }`.
- **`WAMLDocument`** provides several utility functions from a WAML document.
  - **`metadata`** extracts the metadata of a WAML document. Currently the metadata contains just the document's answer.
  - **`sanitize`** extracts plain text from a WAML document.
  - **`findReferences`** extracts external resources (e.g., image, passage) of a WAML document.
- **`isMooToken`** checks whether the object is a primitive Moo token.
- **`hasKind`** checks whether the object is a component token.

## Grammar

### Question

```
# What is the least common multiple of 6 and 10?
```

> ![question](https://user-images.githubusercontent.com/101630758/227753475-3078bbaa-7648-4b0c-b0ab-b4ed8a6c3a4e.png)

### Option

```
{1} 12
{2} 20
{3} 30
{4} 60
```

> ![option](https://user-images.githubusercontent.com/101630758/227753482-8f0df222-a7ec-4014-b02a-92d6a4cfbb36.png)

### Answer

```
@answer {3}
```

> ![option-and-answer](https://user-images.githubusercontent.com/101630758/227753541-0add3e8b-b4e8-4178-9e59-69f39f47e18e.png)

### Subjective

```
# What is the greatest common factor of 6 and 10?
{{  }}
@answer {{2}}
```

> ![subjective](https://user-images.githubusercontent.com/101630758/227754663-062ac08f-1921-480d-9ef5-6c594ae9a999.png)

### Text Style

```
*Italic*
**Bold**
***Bold and italic***
__Underline__
```

> ![text-style](https://user-images.githubusercontent.com/101630758/227753611-4b7516a7-1f6e-4602-b391-deefd9128ba0.png)

You can escape those letters with `\`.

```
if \__name\__ == '\__main\__':
```

> ![escape](https://user-images.githubusercontent.com/101630758/227753708-31525592-7c62-449c-baa1-56c493614e2e.png)

### Quotation

```
> Once upon a time there was a princess...
```

> ![quotation](https://user-images.githubusercontent.com/101630758/227753805-394bf914-c45c-4b7f-8b86-ac354e5668c2.png)

### Indentation (v1.4~)

```
Level 1
| Level 2
| | Level 3
```

### Horizontal Line (v1.4~)

```
A
---
B
```

### Anchor (v1.4~)

```
$$
  x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
^> (1)
```

> ![anchor](https://github.com/riiid/waml/assets/101630758/74a5ee70-0c26-4cc3-859b-9eeb587a2672)

### Footnote

```
*) ATP: adenosine triphosphate
```

> ![footnote](https://user-images.githubusercontent.com/101630758/227753876-c3fb953f-5140-46ed-9b8d-3d842612f90d.png)

### Medium (image, audio, video)

- Image

  ```
  !(https://example.com/images/dog.png)
  !i(https://example.com/images/dog.png)
  ```

- Audio

  ```
  !a(https://example.com/images/song.mp3)
  ```

- Video

  ```
  !v(https://example.com/images/movie.mp4)
  ```

- Alternative text
  ```
  !i[two dogs running together](https://example.com/images/dog2.png)
  ```

### Passage Import\*

```
@passage https://example.com/passages/123.waml
```

### Math

```
Solution of a quadratic equation $ax^2 + bx + c = 0$:
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

![math](https://user-images.githubusercontent.com/101630758/227754315-0fcc1d83-5614-4230-a1c5-d2044f79e597.png)

### Title and Caption (Addons of Figure) (v1.4~)

- Addons of a table

  ```
  ## Title
  <table>
  [1][2][3]
  </table>
  )) Caption
  ```

- Addons of a quotation

  ```
  > ## Title
  > 123
  > )) Caption
  ```

- Addons of a medium
  ```
  ## Title
  ![alt](url)
  )) Caption
  ```

### Custom CSS

```
Hello, [[highlight: World]]!
[[highlight]]
> Quotation box is also a target of custom CSS.

<style>
.highlight{
  background-color: yellow;
}
</style>
```

![custom-css](https://user-images.githubusercontent.com/101630758/227754444-28ec10d6-23a4-4b40-a941-6443924da0a9.png)

### Explanation

```
<explanation>
Use prime factorization to find the GCF: 6 goes 2×3 and 10 goes 2×5.
</explanation>
```

![explanation](https://user-images.githubusercontent.com/101630758/227754797-971b2a89-9c89-4d19-9c12-6a508c7e3d24.png)

## Complex Example

```
# 세 상수 $a$, $b$, $c$에 대하여 함수 $f(x) = ae^{2x} + be^{x} + c$가
# 다음 조건을 만족시킨다.
#
# [[Box]]
# > (가) $\lim_{x \rightarrow -\infty}{\frac{f(x) + 6}{e^{x}}} = 1$
# > (나) $f(\ln 2) = 0$
#
# 함수 $f(x)$의 역함수를 $g(x)$라 할 때,
# $\int_{0}^{14}{g(x)dx} = p + q \ln 2$이다. $p + q$의 값을 구하시오.
# (단, $p$, $q$는 유리수이고, $\ln 2$는 무리수이다.) [4점]

{1} love - return
{2} attention - happen
{3} promise - listen
{4} attendance - appear
{5} tears - arrive

@answer {1}

<explanation>
[[Box]]
> NASA scientist Daniella DellaGiustina reports that despite facing the unexpected
> obstacle of a surface mostly covered in boulders, OSIRIS-Rex successfully
> __collected__ a sample of the surface, [[clue: gathering pieces of it to bring back to Earth.]]

"Collected," which means acquired and took away, is connected to the phrase "gathering pieces of it...," which describes OSIRIS-Rex's action.
Note that the two phrases below are basically similar in meaning and structure.

[[study-tips]]
> A participal phrase at the end of a sentence gives extra information
> about the earlier word of a sentence, creating a logical connection.
</explanation>
<style>
.clue{
  color: white;
  background-color: black;
}
.study-tips::before{
  content: "Study Tips";
  display: block;
  padding: 0 4px;
  font-size: 12px;
  background-image: linear-gradient(to right, #EEE, transparent);
}
</style>
```

> ![sample](https://user-images.githubusercontent.com/101630758/227754921-acf96248-dfb5-4451-be27-f0b87b0d7da4.png)

## Caveat

- The output images above are from an in-company viewer. Depending on viewer implementation, the output may be different.
- URI in media and passage imports should be treated by viewers. WAML just treats it as a string.
