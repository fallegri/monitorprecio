import { MonitoringConfigForm } from '@/components/config/MonitoringConfigForm'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground mt-1">
          Parámetros de frecuencia y ejecución del motor de relevamiento
        </p>
      </div>
      <MonitoringConfigForm />
    </div>
  )
}
