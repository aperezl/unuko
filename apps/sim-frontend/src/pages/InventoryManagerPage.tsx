import React from 'react';
import { Subscriber } from '@unuko/core';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, Trash2, RefreshCw, Info, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export const InventoryManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/v1/inventory/subscribers');
      const data = await response.json();
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (imsi: string) => {
    if (!confirm(`Are you sure you want to delete subscriber ${imsi}?`)) return;
    try {
      await fetch(`/v1/inventory/subscribers/${imsi}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Database className="w-8 h-8" />
            </div>
            5G SUBSCRIBER INVENTORY
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Synchronized with Open5GS SDM (Subscriber Data Management)
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            size="icon"
            onClick={fetchSubscribers}
            title="Refresh"
            className="h-12 w-12 rounded-xl"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => navigate('/inventory/new')}
            className="flex items-center gap-2 px-5 h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            PROVISION NEW IMSI
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md border border-border flex flex-col overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Icon</TableHead>
              <TableHead>Subscriber IMSI</TableHead>
              <TableHead>Security Credentials</TableHead>
              <TableHead>Network Slices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing with 5G Core...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map(sub => (
                <TableRow key={sub.imsi} className="group transition-colors">
                  <TableCell className="text-center">
                    <div className="w-8 h-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                      <Database className="w-4 h-4" />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-mono font-bold text-foreground">{sub.imsi}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest">K:</span>
                        <span className="text-primary font-mono tracking-[0.2em]">••••••••••••••••</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest">{sub.opType}:</span>
                        <span className="text-primary font-mono tracking-[0.2em]">••••••••••••••••</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {sub.slices.map((slice, i) => (
                        <Badge key={i} variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest py-0">
                          SST:{slice.sst} {slice.sd ? `SD:${slice.sd}` : ''} {slice.isDefault ? '• DEF' : ''}
                        </Badge>
                      ))}
                      {sub.slices.length === 0 && (
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest py-0">
                          No Slices
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/inventory/edit/${sub.imsi}`)}
                        className="h-8 w-8 hover:text-primary hover:border-primary/50"
                        title="Edit Subscriber"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(sub.imsi)}
                        className="h-8 w-8 hover:text-destructive hover:border-destructive/50"
                        title="Delete from Core"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && subscribers.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border border-dashed mt-6">
          <Database className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-bold text-foreground mb-2">Empty Core Database</h3>
          <p className="text-muted-foreground">No subscribers found in the Open5GS SDM. Provision your first IMSI to get started.</p>
        </div>
      )}
    </div>
  );
};
