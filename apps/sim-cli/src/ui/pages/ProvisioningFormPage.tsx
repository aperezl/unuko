import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, Save, Shield, Globe, 
  Activity, Plus, Trash2, Server
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

const sliceSchema = z.object({
  sst: z.coerce.number().min(1).max(255),
  sd: z.string().max(6).optional(),
  isDefault: z.boolean()
});

const subscriberSchema = z.object({
  imsi: z.string().min(15).max(15),
  k: z.string().min(32).max(32),
  opc: z.string().min(32).max(32),
  opType: z.enum(['OPC', 'OP']),
  amf: z.string().min(4).max(4),
  slices: z.array(sliceSchema).min(1, 'At least one slice is required')
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

export const ProvisioningFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { imsi } = useParams();
  const isEdit = !!imsi;

  const [loading, setLoading] = React.useState(isEdit);

  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      imsi: '',
      k: '465B5CE8B199B49FAA5F0A2EE238A6BC',
      opc: 'E8ED289DEBA952E4283B54E88E6183CA',
      opType: 'OPC',
      amf: '8000',
      slices: [{ sst: 1, sd: '010203', isDefault: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slices"
  });

  useEffect(() => {
    if (isEdit) {
      fetch(`/v1/inventory/subscribers/${imsi}`)
        .then(res => res.json())
        .then(data => {
          form.reset(data);
          setLoading(false);
        });
    }
  }, [imsi, isEdit, form]);

  const onSubmit = async (data: SubscriberFormValues) => {
    try {
      // Mocked extended data
      const extendedData = {
        ambr: { uplink: 1, downlink: 1, unit: 3 },
        accessRestriction: 32,
        tauTimer: 12
      };

      await fetch('/v1/inventory/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...extendedData })
      });
      navigate('/inventory');
    } catch (err) {
      console.error('Failed to save subscriber:', err);
    }
  };

  if (loading) return <div className="p-20 text-center font-mono text-muted-foreground animate-pulse">Loading subscriber data...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">
            {isEdit ? `Edit Subscriber: ${imsi}` : 'Provision New 5G Subscriber'}
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Core: Open5GS • SDM Protocol: MongoDB Direct
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-sm uppercase tracking-widest">
                <Shield className="w-4 h-4" /> Identity & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imsi">IMSI (Subscription Identifier)</Label>
                <Input 
                  id="imsi"
                  disabled={isEdit}
                  placeholder="999700000000001"
                  {...form.register('imsi')}
                  error={form.formState.errors.imsi?.message}
                  className="font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="k">Authentication Key (K)</Label>
                  <Input 
                    id="k"
                    {...form.register('k')}
                    error={form.formState.errors.k?.message}
                    className="font-mono text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opc">Operator Key ({form.watch('opType')})</Label>
                  <Input 
                    id="opc"
                    {...form.register('opc')}
                    error={form.formState.errors.opc?.message}
                    className="font-mono text-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amf">AMF (Auth Mgmt)</Label>
                  <Input 
                    id="amf"
                    {...form.register('amf')}
                    error={form.formState.errors.amf?.message}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opType">Operator Type</Label>
                  <select 
                    id="opType"
                    {...form.register('opType')}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="OPC">OPC</option>
                    <option value="OP">OP</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-500 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Activity className="w-4 h-4" /> Network AMBR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">Maximum Uplink Rate</span>
                  <span className="text-emerald-500 font-bold font-mono">1 Gbps</span>
                </div>
                <input type="range" className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">Maximum Downlink Rate</span>
                  <span className="text-emerald-500 font-bold font-mono">1 Gbps</span>
                </div>
                <input type="range" className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
              <div className="bg-muted/50 p-4 rounded-md border border-border">
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <Globe className="text-primary w-4 h-4" />
                  Access Restriction: <span className="text-foreground font-mono">NR (5G) Allowed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-amber-500 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Server className="w-4 h-4" /> Network Slices
            </CardTitle>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ sst: 1, sd: '', isDefault: false })}
              className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
            >
              <Plus className="w-4 h-4 mr-2" /> ADD SLICE
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-border rounded-md p-6 relative group bg-muted/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-md" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Slice Service Type (SST)</Label>
                    <Input 
                      type="number"
                      {...form.register(`slices.${index}.sst`)}
                      error={form.formState.errors.slices?.[index]?.sst?.message}
                      className="font-mono focus-visible:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slice Differentiator (SD)</Label>
                    <Input 
                      {...form.register(`slices.${index}.sd`)}
                      error={form.formState.errors.slices?.[index]?.sd?.message}
                      placeholder="010203"
                      className="font-mono focus-visible:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>APN / Data Network</Label>
                    <Input value="internet" disabled className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>QoS Index (5QI)</Label>
                    <select disabled className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm opacity-50">
                      <option value="9">9 (Default Video/TCP)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <input 
                      type="checkbox" 
                      id={`default-${index}`}
                      {...form.register(`slices.${index}.isDefault`)}
                      className="w-4 h-4 rounded bg-background border-border text-amber-500 focus:ring-amber-500" 
                    />
                    <Label htmlFor={`default-${index}`} className="cursor-pointer">Default Slice</Label>
                  </div>
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/inventory')}
          >
            CANCEL
          </Button>
          <Button 
            type="submit"
            size="lg"
            className="shadow-xl shadow-primary/20"
          >
            <Save className="w-4 h-4 mr-2" /> 
            {isEdit ? 'UPDATE SUBSCRIBER' : 'PROVISION IMSI'}
          </Button>
        </div>
      </form>
    </div>
  );
};
