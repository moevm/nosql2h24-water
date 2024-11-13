import { useEffect, useState } from "preact/hooks";

interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number];
}

interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: Array<Array<[number, number]>>;
}

interface User {
  id: string;
  email: string;
  registration_date: string;
  profile_update_date: string;
  avatar_url: string;
}

interface Point {
  id: string;
  coordinates: GeoJSONPoint;
  description: string;
  availability: number;
}

interface Route {
  id: string;
  points: string[];
  author: string;
  popularity_score: number;
}

interface Lake {
  id: string;
  name: string;
  description: string;
  coordinates_boundary: GeoJSONPolygon;
  availability_score: number;
  max_depth: number;
  inflowing_rivers: string[];
  outflowing_rivers: string[];
  salinity: number;
}

interface SupportRequestReview {
  text: string;
  date: string;
  photo: string;
}

interface SupportRequest {
  id: string;
  author: string;
  route_reference?: string;
  lake_reference?: string;
  subject: string;
  reviews: SupportRequestReview[];
}

type DataItem = User | Point | Route | Lake | SupportRequest;

type DataCategory =
  | "users"
  | "points"
  | "routes"
  | "lakes"
  | "support_requests";

export default function DataDisplay() {
  const [category, setCategory] = useState<DataCategory>("users");
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [category]);

  const fetchData = async () => {
    const response = await fetch(`http://localhost:34567/${category}`);
    if (!response.ok) {
      console.error("Failed to fetch data");
      return;
    }
    const jsonData = await response.json();
    setData(jsonData);
  };

  const renderTableHeaders = () => {
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
  };

  const renderTableRows = () => {
    return data.map((item, index) => (
      <tr
        key={index}
        class={`${index % 2 === 0 ? "bg-nord0" : "bg-nord1"} hover:bg-nord2`}
      >
        {Object.values(item).map((value, i) => (
          <td key={i} class="px-4 py-2 border-b border-nord4">
            {renderCellValue(value)}
          </td>
        ))}
      </tr>
    ));
  };

  const renderCellValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    } else if (typeof value === "string" || typeof value === "number") {
      return value;
    } else if (Array.isArray(value)) {
      return value.join(", ");
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  return (
    <div class="p-4">
      <div class="mb-6">
        <label class="text-nord6 font-semibold mr-2">
          Select Data Category:
        </label>
        <select
          class="bg-nord0 text-nord6 border border-nord4 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-nord8"
          value={category}
          onChange={(e) =>
            setCategory(
              (e.target as HTMLSelectElement).value as DataCategory,
            )}
        >
          <option value="users">Пользователи</option>
          <option value="points">Точки</option>
          <option value="routes">Маршруты</option>
          <option value="lakes">Озера</option>
          <option value="support_requests">Обращения в поддержку</option>
        </select>
      </div>
      <div class="overflow-auto rounded-lg shadow">
        <table class="min-w-full table-auto bg-nord0 text-nord6">
          <thead class="bg-nord3">
            {renderTableHeaders()}
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
}

