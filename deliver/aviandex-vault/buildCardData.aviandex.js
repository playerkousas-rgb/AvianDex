  /* ---------- AvianDex 鳥類圖鑑卡（欄位由資料帶入，AI 唔准改） ---------- */
  if (CTX.currentSystem === 'aviandex') {
    const printedLines = CTX.val('printed_text') || [];
    return {
      family: 'AvianDex bird encyclopedia card',
      subject: 'ONE single bird, photorealistic, the exact species described below. '
        + 'The bird is the hero of the picture: complete body, clear head, natural posture, perched or standing.',
      art_style: {
        rendering: 'Photorealistic bird photography look, sharp feather detail, soft natural bokeh background, '
          + 'even daylight, no HDR halo, no illustration, no cartoon.',
        theme: CTX.val('species_hint') || ''
      },
      character_details: {
        pose: CTX.val('pose') || '側身站立，身體完整入鏡，自然姿態',
        expression: '',
        hair: '',
        clothing: ''
      },
      background: {
        setting: 'natural habitat, blurred softly so the bird stands out',
        details: '',
        atmosphere: ''
      },
      card_layout: {
        dimensions: CTX.META().dims,
        ui_elements: printedLines,
        forbidden_elements: 'extra slogans, QR codes, barcodes, price tags, advertisement text, '
          + 'any invented statistics, any simplified Chinese characters, any second bird'
      },
      visual_effects: {
        finish: CTX.META().finish,
        lighting: 'soft even daylight',
        texture: 'matte letterpress paper'
      }
    };
  }

