import { Dispatch, StateUpdater, useState } from "preact/hooks";
import {
  Point as GeoJsonPoint,
  Polygon as GeoJsonPolygon,
} from "npm:@types/geojson";
import DataTable from "./DataTable.tsx";

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
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

interface SupportTicket {
  id: string;
  author_id: string;
  route_reference?: string;
  lake_reference?: string;
  subject: string;
  text: string;
  created_at: string;
}

export type DataItem = User | Point | Route | Lake | SupportTicket;

export type DataCategory =
  | "users"
  | "points"
  | "routes"
  | "lakes"
  | "support-tickets";

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
  popularity_score?: number;
  point_ids?: string[];
  inflowing_rivers?: string[];
  outflowing_rivers?: string[];
  coordinates_boundary?: GeoJsonPolygon;
  route_reference?: string;
  lake_reference?: string;
  author_id?: string;
  text?: string;
};

function handleAddEntry(
  category: DataCategory,
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  fetch(`http://localhost:8000/${category}/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then(() => setFormData({}))
    .catch((e) => console.error(e));
}

function DataDisplay() {
  const [category, setCategory] = useState<DataCategory>("users");
  const [formData, setFormData] = useState<FormData>({});
  const [addEntryShown, setAddEntryShown] = useState<boolean>(false);

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
          }}
        >
          <option value="users">Пользователи</option>
          <option value="points">Точки</option>
          <option value="routes">Маршруты</option>
          <option value="lakes">Озера</option>
          <option value="support-tickets">Обращения в поддержку</option>
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

      {addEntryShown &&
        addEntryForm(category, formData, setFormData)}

      {!addEntryShown && <DataTable category={category} />}
    </div>
  );
}

function addEntryForm(
  category: DataCategory,
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  return (
    <>
      {renderInputs(category, formData, setFormData)}

      <button
        onClick={() => handleAddEntry(category, formData, setFormData)}
        class="bg-nord8 text-nord0 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-nord8 mb-6"
      >
        Добавить
      </button>
    </>
  );
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
    case "support-tickets":
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
          type="text"
          placeholder="example_user"
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
          placeholder="example@test.tt"
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
  return (
    <div class="mb-4 space-y-2">
      <div class="mb-2">
        <label class="block text-nord0 mb-1">ID автора маршрута</label>
        <input
          type="text"
          placeholder="52301557-9fb9-4be0-b71e-8c73c1f20abf"
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
        <label class="block text-nord0 mb-1">Индекс популярности</label>
        <input
          type="number"
          placeholder="1.0"
          step="0.1"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.popularity_score || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              popularity_score: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
      {/* TODO: Support more than two points in route */}
      <label class="block mb-1">ID точек</label>
      <input
        type="text"
        placeholder="eecdd55d-4953-45b8-b54c-381fe9e6abd6"
        class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
        value={formData.point_ids?.at(0) || ""}
        onChange={(e) => {
          setFormData({
            ...formData,
            point_ids: [
              (e.target as HTMLInputElement).value,
              formData.point_ids?.at(1) || "",
            ],
          });
        }}
      />
      <input
        type="text"
        placeholder="87cdceae-3cdd-410b-a76e-726b25ef53d4"
        class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
        value={formData.point_ids?.at(1) || ""}
        onChange={(e) => {
          setFormData({
            ...formData,
            point_ids: [
              formData.point_ids?.at(0) || "",
              (e.target as HTMLInputElement).value,
            ],
          });
        }}
      />
    </div>
  );
}

function renderLakesInput(
  formData: FormData,
  setFormData: Dispatch<StateUpdater<FormData>>,
) {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);

  const addPoint = () => {
    setCoordinates([...coordinates, [0, 0]]);
  };

  const updatePoint = (index: number, coord: [number, number]) => {
    const newCoordinates = [...coordinates];
    newCoordinates[index] = coord;
    setCoordinates(newCoordinates);

    formData.coordinates_boundary = {
      type: "Polygon",
      // GeoJSON Polygons have an array of Linear Rings. Each Linear Ring is an array of positions.
      coordinates: [newCoordinates],
    };
  };
  return (
    <div class="mb-4">
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Название озера</label>
        <input
          type="text"
          placeholder="Озеро на Невском"
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
          placeholder="Описание озера на Невском"
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
          step="0.1"
          placeholder="50.0"
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
          step="0.1"
          placeholder="1.0"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.salinity !== undefined ? formData.salinity : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              salinity: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
      <div>
        <label class="block text-nord0 mb-1">Индекс доступности</label>
        <input
          type="number"
          step="0.1"
          placeholder="1.0"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.availability !== undefined
            ? formData.availability
            : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              availability: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>
      <label class="block mb-1">Впадающие реки</label>
      <input
        type="text"
        placeholder="Нева"
        class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
        value={formData.inflowing_rivers?.at(0) || ""}
        onChange={(e) => {
          setFormData({
            ...formData,
            inflowing_rivers: [
              (e.target as HTMLInputElement).value,
            ],
          });
        }}
      />
      <label class="block mb-1">Вытекающие реки</label>
      <input
        type="text"
        placeholder="Волга"
        class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
        value={formData.outflowing_rivers?.at(1) || ""}
        onChange={(e) => {
          setFormData({
            ...formData,
            outflowing_rivers: [
              (e.target as HTMLInputElement).value,
            ],
          });
        }}
      />
      <div class="mb-2">
        <div class="flex items-center space-x-4 md:space-x-2 mb-6 h-10 my-2">
          <label class="flex items-center mb-1">
            Координаты точек-границ озера
            <button
              class="ml-2 bg-nord8 text-nord0 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-nord8"
              type="button"
              onClick={addPoint}
            >
              Добавить точку
            </button>
          </label>
        </div>
        {coordinates.map((coord: [number, number], index: number) => (
          <div class="flex items-center space-x-4" key={index}>
            <label class="block">
              Точка {index + 1} Longitude:
              <input
                type="number"
                value={coord[0]}
                class="w-full text-nord0 border border-nord4 rounded px-2"
                placeholder="00.000000"
                step="0.000001"
                onInput={(e) => {
                  const value = parseFloat(
                    (e.target as HTMLInputElement).value,
                  );
                  updatePoint(index, [value, coord[1]]);
                }}
              />
            </label>
            <label class="block">
              Точка {index + 1} Latitude:
              <input
                type="number"
                value={coord[1]}
                class="w-full text-nord0 border border-nord4 rounded px-2"
                placeholder="00.000000"
                step="0.000001"
                onInput={(e) => {
                  const value = parseFloat(
                    (e.target as HTMLInputElement).value,
                  );
                  updatePoint(index, [coord[0], value]);
                }}
              />
            </label>
          </div>
        ))}
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
        <label class="block text-nord0 mb-1">ID автора</label>
        <input
          type="text"
          placeholder="9f179371-23b9-416c-b48e-4601610b5213"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.author_id || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              author_id: (e.target as HTMLInputElement).value,
            });
          }}
        />
      </div>
      <div>
        <label class="block text-nord0 mb-1">Тема запроса</label>
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
      <div class="mb-2">
        <label class="block text-nord0 mb-1">Описание проблемы</label>
        <textarea
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          placeholder="Описание озера на Невском"
          value={formData.text || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              text: (e.target as HTMLTextAreaElement).value,
            })}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">ID Маршрута</label>
        <input
          type="text"
          placeholder="9f179371-23b9-416c-b48e-4601610b5213"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.route_reference || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              route_reference: (e.target as HTMLInputElement).value,
            });
          }}
        />
      </div>
      <div class="mb-2">
        <label class="block text-nord0 mb-1">ID Озера</label>
        <input
          type="text"
          placeholder="9f179371-23b9-416c-b48e-4601610b5213"
          class="w-full text-nord0 border border-nord4 rounded px-2 py-1"
          value={formData.lake_reference || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              lake_reference: (e.target as HTMLInputElement).value,
            });
          }}
        />
      </div>
    </div>
  );
}

export default DataDisplay;
