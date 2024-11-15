import { Dispatch, StateUpdater, useEffect, useState } from "preact/hooks";
import {
  Point as GeoJsonPoint,
  Polygon as GeoJsonPolygon,
} from "npm:@types/geojson";

interface User {
  id: string;
  name: string;
  email: string;
  registration_date: string;
  profile_update_date: string;
  avatar_url: string;
}

interface Point {
  id: string;
  coordinates: GeoJsonPoint;
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
  coordinates_boundary: GeoJsonPolygon;
  availability_score: number;
  max_depth: number;
  inflowing_rivers: string[];
  outflowing_rivers: string[];
  salinity: number;
}

interface SupportRequest {
  id: string;
  author: string;
  route_reference?: string;
  lake_reference?: string;
  subject: string;
  text: string;
  date: string;
  photo: string;
}

type DataItem = User | Point | Route | Lake | SupportRequest;
type DataCell = string | number | string[] | GeoJsonPoint | GeoJsonPolygon;

type DataCategory =
  | "users"
  | "points"
  | "routes"
  | "lakes"
  | "support-requests";

type FormData = {
  email?: string;
  avatar_url?: string;
  description?: string;
  availability?: number;
  author?: string;
  name?: string;
  max_depth?: number;
  salinity?: number;
  subject?: string;
  coordinates?: GeoJsonPoint;
};

function DataDisplay() {
  const [category, setCategory] = useState<DataCategory>("users");
  const [data, setData] = useState<DataItem[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [addEntryShown, setAddEntryShown] = useState<boolean>(false);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [category]);

  const fetchData = async () => {
    setData([]);

    const response = await fetch(`http://localhost:8000/${category}`);
    if (!response.ok) {
      console.error("Failed to fetch data");
      return;
    }

    const jsonData = await response.json();
    setData(jsonData);
  };

  const handleAddEntry = async () => {
    const response = await fetch(`http://localhost:8000/${category}/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      console.error("Failed to add data");
      return;
    }
    // Clear form and refresh data
    setFormData({});
    fetchData();
  };

  const addEntryForm = () => {
    return (
      <div>
        {renderInputs(category, formData, setFormData)}

        <button
          onClick={handleAddEntry}
          class="bg-nord8 text-nord0 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-nord8 mb-6"
        >
          Добавить
        </button>
      </div>
    );
  };

  return (
    <div class="p-4">
      <div class="flex items-center space-x-2 md:space-x-4 px-3 mb-6 h-10">
        <select
          class="bg-nord6 text-nord0 border border-nord4 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-nord8 w-64"
          value={category}
          onChange={(e) => {
            setCategory(
              (e.target as HTMLSelectElement).value as DataCategory,
            );
            setFormData({});
            fetchData();
          }}
        >
          <option value="users">Пользователи</option>
          <option value="points">Точки</option>
          <option value="routes">Маршруты</option>
          <option value="lakes">Озера</option>
          <option value="support-requests">Обращения в поддержку</option>
        </select>
        <button
          class="flex items-center justify-center w-10 h-10 text-nord0 rounded hover:bg-nord5"
          onClick={() => {
            setAddEntryShown(!addEntryShown);
          }}
        >
          {addEntryShown
            ? (
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 15l-6-6-6 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )
            : (
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            )}
        </button>
      </div>

      {addEntryShown && addEntryForm()}

      <div class="overflow-auto rounded-lg shadow">
        <table class="min-w-full table-auto bg-nord5 text-nord0">
          <thead class="bg-nord7">{renderTableHeaders(data)}</thead>
          <tbody class="bg-nord4">{renderTableRows(data)}</tbody>
        </table>
      </div>
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

function renderInputs(
  category: DataCategory,
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  switch (category) {
    case "users":
      return renderUsersInput(formData, setFormData);
    case "points":
      return renderPointsInput(formData, setFormData);
    case "routes":
      return renderRoutesInput(formData, setFormData);
    case "lakes":
      return renderLakesInput(formData, setFormData);
    case "support-requests":
      return renderSupportRequestsInput(formData, setFormData);
    default:
      return null;
  }
}

function renderUsersInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return (
    <div class="mb-4">
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Имя пользователя</label>
        <input
          type="email"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.name || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: (e.target as HTMLInputElement).value,
            })}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Email</label>
        <input
          type="email"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.email || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: (e.target as HTMLInputElement).value,
            })}
        />
      </div>
    </div>
  );
}

function renderPointsInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return (
    <div class="mb-4">
      <label class="block mb-1">Координаты точки</label>
      <div class="mb-2 flex items-center space-x-2">
        <input
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          type="number"
          step="0.000001"
          placeholder="00.000000"
          value={formData.coordinates?.coordinates.at(0) || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              coordinates: {
                type: "Point",
                coordinates: [
                  Number(
                    (e.target as HTMLInputElement).value,
                  ),
                  formData.coordinates?.coordinates.at(1) || 0.0,
                ],
              },
            });
          }}
        />
        <input
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          type="number"
          step="0.000001"
          placeholder="00.000000"
          value={formData.coordinates?.coordinates.at(1) || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              coordinates: {
                type: "Point",
                coordinates: [
                  formData.coordinates?.coordinates.at(0) || 0.0,
                  Number(
                    (e.target as HTMLInputElement).value,
                  ),
                ],
              },
            });
          }}
        />
      </div>
      <div>
        <label class="block text-nord0 mb-1">Индекс доступности</label>
        <input
          type="number"
          placeholder="1.0"
          step="0.1"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.availability || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              availability: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Описание</label>
        <textarea
          placeholder="Описание точки..."
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: (e.target as HTMLTextAreaElement).value,
            })}
        />
      </div>
    </div>
  );
}

function renderRoutesInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return <div></div>;
}

function renderLakesInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return (
    <div class="mb-4">
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Имя</label>
        <input
          type="text"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.name || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: (e.target as HTMLInputElement).value,
            })}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Описание</label>
        <textarea
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: (e.target as HTMLTextAreaElement).value,
            })}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Глубина</label>
        <input
          type="number"
          step="any"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.max_depth !== undefined ? formData.max_depth : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              max_depth: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
      <div>
        <label class="block text-nord0 mb-1">Содержание соли</label>
        <input
          type="number"
          step="any"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.salinity !== undefined ? formData.salinity : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              salinity: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
    </div>
  );
}

function renderSupportRequestsInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return (
    <div class="mb-4">
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Автор</label>
        <input
          type="text"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.author || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              author: (e.target as HTMLInputElement).value,
            })}
        />
      </div>
      <div>
        <label class="block text-nord0 mb-1">Содержание</label>
        <input
          type="text"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.subject || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              subject: (e.target as HTMLInputElement).value,
            })}
        />
      </div>
    </div>
  );
}

export default DataDisplay;
