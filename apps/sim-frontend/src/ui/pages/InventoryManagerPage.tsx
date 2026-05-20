import React from 'react';
import { Subscriber } from '../../core/domain/subscriber.types';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, Trash2, Info, Edit3 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { TableHeaderCell } from '../molecules/TableHeaderCell';
import { PageHeader } from '../organisms/PageHeader';
import { subscriberRepository } from '../../infrastructure/adapters/HttpSubscriberRepository';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export const InventoryManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await subscriberRepository.getSubscribers();
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
      await subscriberRepository.deleteSubscriber(imsi);
      fetchSubscribers();
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader
        title="5G Subscriber Inventory"
        subtitle="Synchronized with Open5GS SDM (Subscriber Data Management)"
        navigation={
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <Info className="w-4 h-4" />
            Active database tracking profiles
          </p>
        }
        actions={
          <div className="flex gap-3">
            <Button 
              variant="outline"
              size="icon"
              onClick={fetchSubscribers}
              title="Refresh"
              className="h-12 w-12 rounded-xl"
            >
              {loading ? <Spinner className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </Button>
            <Button 
              onClick={() => navigate('/inventory/new')}
              className="flex items-center gap-2 px-5 h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              PROVISION NEW IMSI
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-md border border-border flex flex-col overflow-hidden shadow-xl mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell className="w-16 text-center">Icon</TableHeaderCell>
              <TableHeaderCell>Subscriber IMSI</TableHeaderCell>
              <TableHeaderCell>Security Credentials</TableHeaderCell>
              <TableHeaderCell>Network Slices</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                    <Spinner className="w-8 h-8 text-muted-foreground" />
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
                        <span className="text-muted-foreground font-bold uppercase tracking-widest">{sub.opType || 'OPC'}:</span>
                        <span className="text-primary font-mono tracking-[0.2em]">••••••••••••••••</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {sub.slices && sub.slices.map((slice: any, i: number) => (
                        <Badge key={i} variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest py-0">
                          SST:{slice.sst} {slice.sd ? `SD:${slice.sd}` : ''} {slice.isDefault ? '• DEF' : ''}
                        </Badge>
                      ))}
                      {(!sub.slices || sub.slices.length === 0) && (
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
