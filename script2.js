fetch("countries.json")
  .then(r => r.json())
  .then(countries => {

    // 🔹 RULE (your first Matching rule)
    const rule = {
      type: "Matching",
      property: "continent",
      value: "Europe",
      mode: "include" // include or exclude
    };

    // 🔹 APPLY RULE
    const result = countries.filter(country => {
      const match = country[rule.property] === rule.value;
      return rule.mode === "include" ? match : !match;
    });

    // 🔹 DISPLAY RESULT
    document.body.innerHTML = "<h2>Filtered Countries:</h2><pre>" +
      JSON.stringify(result, null, 2) +
      "</pre>";
  });
