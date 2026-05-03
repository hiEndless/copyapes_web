"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function VipCodeTab() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>创建7天体验兑换码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
            <Label className="w-20 shrink-0 text-right text-sm font-medium">兑换码个数</Label>
            <Input 
              type="number"
              placeholder="eg. 10表示创建10个兑换码" 
              className="max-w-[280px] bg-background" 
            />
            <Button variant="default" className="min-w-24">创建</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>兑换码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-primary">兑换码</TableHead>
                  <TableHead className="font-semibold text-primary">兑换码类型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>8WcbAlMabmDc</TableCell>
                  <TableCell>30天正式VIP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ItR6COOgFc2D</TableCell>
                  <TableCell>30天正式VIP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>T1euzwoN1QJV</TableCell>
                  <TableCell>30天正式VIP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>G4jdO88OsNOk</TableCell>
                  <TableCell>7天试用VIP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>MXh05rh8Vrw8</TableCell>
                  <TableCell>7天试用VIP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>IsaTxEq8JlJS</TableCell>
                  <TableCell>7天试用VIP</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}