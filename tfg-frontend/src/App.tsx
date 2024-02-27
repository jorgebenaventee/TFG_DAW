import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'

function App () {
  return (
    <div className='min-h-screen grid place-content-center'>
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesión</CardTitle>
        </CardHeader>
        <CardContent>
          Holi :)
        </CardContent>
      </Card>
    </div>
  )
}

export default App
