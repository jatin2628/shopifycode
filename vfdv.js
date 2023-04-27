$(document).ready(function() {
  const productId = "{{ product.id }}";
  $.ajax({
    url: `http://localhost/product-options/${productId}`,
    method: "GET",
    dataType: "json",
    success: function(productOptions) {
      // Modify the DOM to display product options
      for (let option of productOptions) {
        let optionValuesHtml = "";
        for (let value of option.values) {
          optionValuesHtml += `<label class="single-option-selector">
                                  <input type="radio" name="attributes[${option.name}]" value="${value}"{% if cart.attributes["${option.name}"] == "${value}" %} checked{% endif %}>
                                  <span>${value}</span>
                                </label>`;
        }
        $('.product-options').append(`<div class="selector-wrapper">
                                        <label>${option.name}</label><br>
                                        ${optionValuesHtml}
                                      </div>`);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("AJAX error:", textStatus, errorThrown);
    }
  });
});
