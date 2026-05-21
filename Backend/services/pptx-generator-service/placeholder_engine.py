from pptx.dml.color import RGBColor

_PRETO = RGBColor(0x1C, 0x1C, 0x1C)
_RESET_COLOR_KEYS = frozenset({"sumario"})


def _replace_placeholders(slide, context: dict) -> None:
    for shape in slide.shapes:
        if shape.has_text_frame:
            for paragraph in shape.text_frame.paragraphs:
                _replace_in_paragraph(paragraph, context)
        if shape.shape_type == 19:  # TABLE
            for row in shape.table.rows:
                for cell in row.cells:
                    for paragraph in cell.text_frame.paragraphs:
                        _replace_in_paragraph(paragraph, context)


def _replace_in_paragraph(paragraph, context: dict) -> None:
    if not paragraph.runs:
        return
    full_text = "".join(run.text for run in paragraph.runs)
    if "{{" not in full_text:
        return
    replaced = full_text
    matched_key = None
    for key, value in context.items():
        new = replaced.replace(f"{{{{ {key} }}}}", str(value) if value is not None else "")
        new = new.replace(f"{{{{{key}}}}}", str(value) if value is not None else "")
        if new != replaced:
            matched_key = key
            replaced = new
    if replaced == full_text:
        return
    paragraph.runs[0].text = replaced
    for run in paragraph.runs[1:]:
        run.text = ""
    if matched_key in _RESET_COLOR_KEYS:
        paragraph.runs[0].font.color.rgb = _PRETO
