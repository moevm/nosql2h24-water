import { useEffect, useState } from "preact/hooks";
import { DataCategory, DataItem } from "./DataDisplay.tsx";
import {
  Point as GeoJsonPoint,
  Polygon as GeoJsonPolygon,
} from "npm:@types/geojson";

type DataCell = string | number | string[] | GeoJsonPoint | GeoJsonPolygon;

interface DataTableProps {
  category: DataCategory;
}

export default function DataTable({ category }: DataTableProps) {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setData([]);

    fetch(`http://localhost:8000/${category}`, { signal })
      .then((data) => data.json())
      .then((data) => setData(data))
      .catch((e) => console.error(e));

    return () => {
      controller.abort();
    };
  }, [category]);

  return (
    <div class="overflow-auto rounded-lg shadow">
      <table class="min-w-full table-auto bg-nord5 text-nord0">
        <thead class="bg-nord7">{renderTableHeaders(data)}</thead>
        <tbody class="bg-nord4">{renderTableRows(data)}</tbody>
      </table>
    </div>
  );
}

function renderTableHeaders(data: DataItem[]) {
  if (data.length === 0) return null;
  return (
    <tr>
      {Object.keys(data[0]).map((key) => (
        <th
          key={key}
          class="px-4 py-2 border-b-2 border-nord4 text-left uppercase tracking-wider"
        >
          {key.replace(/_/g, " ")}
        </th>
      ))}
    </tr>
  );
}

function renderTableRows(data: DataItem[]) {
  if (data.length === 0) {
    return (
      <tr>
        <td
          class="px-4 py-2 text-center"
          colSpan={Object.keys(data[0] || {}).length || 1}
        >
          Нет данных
        </td>
      </tr>
    );
  }

  return data.map((item: DataItem, index: number) => (
    <tr
      key={index}
      class={`${
        index % 2 === 0 ? "bg-nord4" : "bg-nord5"
      } hover:bg-nord6 hover:rounded`}
    >
      {Object.values(item).map((value, i) => (
        <td key={i} class="px-4 py-2 border-b border-nord4">
          {renderCellValue(value)}
        </td>
      ))}
    </tr>
  ));
}

function renderCellValue(value: DataCell) {
  const formatCoordinates = (num: number) => {
    const formatted = num.toFixed(6);
    const parts = formatted.split(".");
    parts[0] = parts[0].padStart(2, "0");
    return parts.join(".");
  };

  if (value === null || value === undefined) {
    return "";
  } else if (typeof value === "string" || typeof value === "number") {
    return value;
  } else if (Array.isArray(value)) {
    return value.join(", ");
  } else if (value?.type === "Point") {
    return [
      formatCoordinates(value.coordinates[0]),
      formatCoordinates(value.coordinates[1]),
    ].join(" ");
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}
