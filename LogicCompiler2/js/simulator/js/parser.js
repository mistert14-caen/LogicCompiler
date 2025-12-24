/* =======================
   Parser Ã©quations
   ======================= */
const PRECEDENCE = {
  
  "/": 5,
  "*": 4,
  "+": 3,
  "-": 3,
  "<<": 2,
  ">>": 2,
  "&": 1,
  "^": 0,
  "|": -1
};

const RIGHT_ASSOC = {
  "/": true
};

function tokenize(expr) {
  const tokens = [];
  let safety = 0;
  let i = 0;

  while (i < expr.length) {
    const c = expr[i];

    if (++safety > 100) {
          throw new Error("Parser stuck (infinite loop)");
    }
  
    // espaces
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // opérateurs doubles
    if (expr.startsWith("<<", i)) {
      tokens.push({ type: "OP", value: "<<" });
      i += 2;
      continue;
    }
    if (expr.startsWith(">>", i)) {
      tokens.push({ type: "OP", value: ">>" });
      i += 2;
      continue;
    }

   
    // hexadécimal : 0xFF
if (c === "0" && (expr[i + 1] === "x" || expr[i + 1] === "X")) {
  let j = i + 2;
  while (j < expr.length && /[0-9a-fA-F]/.test(expr[j])) j++;

  if (j === i + 2)
    throw new Error("Hexa invalide à " + i);

  tokens.push({
    type: "CONST",
    value: parseInt(expr.slice(i, j), 16)
  });
  i = j;
  continue;
}

// binaire : 0b1010
if (c === "0" && (expr[i + 1] === "b" || expr[i + 1] === "B")) {
  let j = i + 2;
  while (j < expr.length && /[01]/.test(expr[j])) j++;

  if (j === i + 2)
    throw new Error("Binaire invalide à " + i);

  tokens.push({
    type: "CONST",
    value: parseInt(expr.slice(i + 2, j), 2)
  });
  i = j;
  continue;
}

    // nombre décimal
    if (/[0-9]/.test(c)) {
      let j = i;
      //while (/[0-9]/.test(expr[j])) j++;
      while (j < expr.length && /[0-9]/.test(expr[j])) j++;

      tokens.push({
        type: "CONST",
        value: parseInt(expr.slice(i, j), 10)
      });
      i = j;
      continue;
    }

    // mémoire : @Q, @ACC, @SEL, etc.
if (c === "@") {
  let j = i + 1;

  if (j >= expr.length || !/[A-Za-z_]/.test(expr[j])) {
    throw new Error("Syntaxe invalide après @ à " + i);
  }

  while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;

  tokens.push({
    type: "VAR",
    name: expr.slice(i, j)   // garde le '@' dans le nom : "@Q"
  });

  i = j;
  continue;
}


    // variable
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      
      while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;
      tokens.push({
        type: "VAR",
        name: expr.slice(i, j)
      });
      i = j;
      continue;
    }

     // opérateurs simples
    if ("+*&|^()/-".includes(c)) {
      tokens.push({
      type: "OP",
      value: c
    });
    i++;
    continue;  
  }

    throw new Error("Token inconnu à " + i);
   
  }

  return tokens;
}





function toRPN(tokens) {
  const output = [];
  const stack = [];

  for (const t of tokens) {

   

    if (t.type === "CONST" || t.type === "VAR") {
      output.push(t);
      continue;
    }

    if (t.type === "OP") {
      if (t.value === "(") {
        stack.push(t);
        continue;
      }

      if (t.value === ")") {
        while (stack.length && stack.at(-1).value !== "(")
          output.push(stack.pop());
        stack.pop();
        continue;
      }

      while (
        stack.length &&
        stack.at(-1).type === "OP" &&
        (
          PRECEDENCE[stack.at(-1).value] > PRECEDENCE[t.value] ||
          (
            PRECEDENCE[stack.at(-1).value] === PRECEDENCE[t.value] &&
            !RIGHT_ASSOC[t.value]
          )
        )
      ) {
        output.push(stack.pop());
      }

      stack.push(t);
    }
  }

  while (stack.length)
    output.push(stack.pop());

  return output;
}
/*
function evalRPN(rpn, vars = {}) {
  const stack = [];

  for (const t of rpn) {
    if (t.type === "CONST") {
      stack.push(t.value);
      continue;
    }

    if (t.type === "VAR") {
      stack.push(vars[t.name] ?? 0);
      continue;
    }

    const op = t.value;

    if (op === "/") {
      stack.push(~stack.pop());
      continue;
    }

    const b = stack.pop();
    const a = stack.pop();

    switch (op) {
      case "+": stack.push(a + b); break;
      case "-": stack.push(a - b); break;
      case "*": stack.push(a * b); break;
      case "<<": stack.push(a << b); break;
      case ">>": stack.push(a >> b); break;
      case "&": stack.push(a & b); break;
      case "|": stack.push(a | b); break;
      case "^": stack.push(a ^ b); break;
      default:
        throw new Error("Opérateur inconnu " + op);
    }
  }

  return stack.pop();
}
*/

function evalRPN(rpn, resolveVar) {
  const stack = [];

  for (const t of rpn) {
    if (t.type === "CONST") {
      stack.push(t.value);
      continue;
    }

    if (t.type === "VAR") {
      stack.push(resolveVar(t.name));
      continue;
    }

    const op = t.value;

    if (op === "/") {               // NOT unaire
      stack.push((stack.pop() ^ 1) & 1);
      continue;
    }

    const b = stack.pop();
    const a = stack.pop();

    switch (op) {
      case "+": stack.push(a + b); break;
      case "-": stack.push(a - b); break;
      case "*": stack.push(a * b); break;
      case "<<": stack.push(a << b); break;
      case ">>": stack.push(a >> b); break;
      case "&": stack.push(a & b); break;
      case "|": stack.push(a | b); break;
      case "^": stack.push(a ^ b); break;
      default:
        throw new Error("Opérateur inconnu " + op);
    }
  }

  return stack.pop();
}

function test(expr, vars = {}) {
  const rpn = toRPN(tokenize(expr));
  const v = evalRPN(rpn, name => vars[name] ?? 0);
  console.log(expr, vars, "=>", v);
}
/*
test("A & B", { A: 0, B: 0 });
test("A & B", { A: 0, B: 1 });
test("A & B", { A: 1, B: 0 });
test("A & B", { A: 1, B: 1 });
test("A & B");
test("A | B");
test("A ^ B");
*/
test("A - B", { A: 5, B: 3 }); // 2
test("A - B - C", { A: 10, B: 3, C: 2 }); // 5
test("A + B - C", { A: 1, B: 2, C: 1 }); // 2
test("(A - B) & 1", { A: 3, B: 2 }); // 1