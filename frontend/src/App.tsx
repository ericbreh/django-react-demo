import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api, type ActionDTO } from "./services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface FormState {
  action: string;
  date: string;
  points: string;
}

export default function App() {
  const [actions, setActions] = useState<ActionDTO[]>([]);
  const [formData, setFormData] = useState<FormState>({ action: "", date: "", points: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch actions when the component builds
  useEffect(() => {
    fetchActions();
  }, []);

  // Function to fetch actions from the API
  async function fetchActions() {
    setLoading(true);
    try {
      const data = await api.list();
      setActions(data);
    } catch {
      setError("Failed to load actions");
    } finally {
      setLoading(false);
    }
  }

  // Functions to handle form state
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.action || !formData.date || formData.points === "") {
      setError("All fields are required");
      return;
    }

    const payload = { action: formData.action, date: formData.date, points: Number(formData.points) };

    try {
      if (editingId) {
        await api.update(editingId, payload);
      } else {
        await api.create(payload);
      }
      resetForm();
      fetchActions();
    } catch (err: any) {
      setError(err.response?.data?.action?.[0] || "Server validation failed");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this action?")) return;
    await api.remove(id);
    fetchActions();
  }

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  function beginEdit(a: ActionDTO) {
    setFormData({ action: a.action, date: a.date, points: String(a.points) });
    setEditingId(a.id);
  }

  function resetForm() {
    setFormData({ action: "", date: "", points: "" });
    setEditingId(null);
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {editingId ? "Edit Action" : "Add Sustainability Action"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="action">Action</Label>
              <Input id="action" value={formData.action} onChange={handleChange("action")} required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={handleChange("date")} required />
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" min="0" value={formData.points} onChange={handleChange("points")} required />
            </div>
            <Button type="submit" className="md:col-span-3">
              {editingId ? "Update" : "Add"}
            </Button>
            {editingId && (
              <Button variant="secondary" type="button" className="md:col-span-3" onClick={resetForm}>
                Cancel
              </Button>
            )}
            {error && (
              <p className="md:col-span-3 text-sm text-red-600">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Actions List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.points}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => beginEdit(a)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && actions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center">
                    No actions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {loading && <p className="py-4">Loading…</p>}
        </CardContent>
      </Card>
    </div>
  );
}
