export function interviewsToRows(interviews, profiles, users) {
  return interviews.map((iv) => {
    const profile = profiles.find((p) => p.id === iv.profileId);
    const interviewer = users.find((u) => u.id === iv.assignedTo);
    return {
      "Profile Name": profile?.name || "Unknown",
      "Current Company": profile?.currentCompany || "—",
      "Interviewer": interviewer?.name || "Unassigned",
      "Round": iv.round,
      "Date": iv.date,
      "Time": iv.time,
      "Status": iv.status,
      "Company (Applied)": iv.company || "—",
      "Meeting Link": iv.meetingLink || "",
      "JD Link": iv.jdLink || "",
      "Description": iv.description || "",
    };
  });
}

export function downloadCSV(rows, filename = "interviews.csv") {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "").replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

export function downloadExcel(rows, filename = "interviews.xlsx") {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);

  const escapeXml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const headerRow = headers
    .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join("");

  const dataRows = rows
    .map(
      (row) =>
        "<Row>" +
        headers
          .map(
            (h) =>
              `<Cell><Data ss:Type="String">${escapeXml(row[h])}</Data></Cell>`
          )
          .join("") +
        "</Row>"
    )
    .join("\n");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E4ECFC" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Interviews">
    <Table>
      <Row ss:StyleID="header">${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel",
  });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
