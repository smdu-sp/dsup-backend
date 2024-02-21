import { Injectable } from '@nestjs/common';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OracleService } from 'src/oracle/oracle.service';

class SOE5P03_LISTA_ZONA_VO {
  // Define the constructor
  constructor(
    private _P_COD_OPEA?: string,
    private _P_COD_ZONA?: string,
    private _P_SGL_ZONA?: string,
    private _P_TXT_DCR_ZONA?: string,
    private _P_MENS_ERRO?: string
  ) {
      this._P_COD_OPEA = '';
      this._P_COD_ZONA = '';
      this._P_SGL_ZONA = '';
      this._P_TXT_DCR_ZONA = '';
      this._P_MENS_ERRO = '';
  }

  // Define the properties
  get P_COD_OPEA() {
      return this._P_COD_OPEA;
  }
  set P_COD_OPEA(value) {
      this._P_COD_OPEA = value;
  }

  get P_COD_ZONA() {
      return this._P_COD_ZONA;
  }
  set P_COD_ZONA(value) {
      this._P_COD_ZONA = value;
  }

  get P_SGL_ZONA() {
      return this._P_SGL_ZONA;
  }
  set P_SGL_ZONA(value) {
      this._P_SGL_ZONA = value;
  }

  get P_TXT_DCR_ZONA() {
      return this._P_TXT_DCR_ZONA;
  }
  set P_TXT_DCR_ZONA(value) {
      this._P_TXT_DCR_ZONA = value;
  }

  get P_MENS_ERRO() {
      return this._P_MENS_ERRO;
  }
  set P_MENS_ERRO(value) {
      this._P_MENS_ERRO = value;
  }
}
@Injectable()
export class UnidadesService {
  constructor(
    private prisma: PrismaService,
    private oracledb: OracleService
  ) {}

  create(createUnidadeDto: CreateUnidadeDto) {
    const novaUnidade = this.prisma.unidade.create({
      data: createUnidadeDto
    })
  }

  findAll() {
    return `This action returns all unidades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unidade`;
  }

  update(id: number, updateUnidadeDto: UpdateUnidadeDto) {
    return `This action updates a #${id} unidade`;
  }

  remove(id: number) {
    return `This action removes a #${id} unidade`;
  }

  async pesquisaZonasDeUso(P_COD_OPEA: string) {
      const objConsulta = {
        P_COD_OPEA: P_COD_OPEA
      }
      const strStoredProcedure = "SOE5P03.SOE5P03_LISTA_ZONA";
      let objUsuarioVO = new SOE5P03_LISTA_ZONA_VO();
      let objListaUsuarioVO = [];

      const objConn = await this.oracledb.connection();
      const objCmd = objConn.execute(strStoredProcedure, objConsulta);
      let objTrans = null;

      // try {
      //     let dtReader = this.oracledb.;
      //     objConn.Open();
      // try {
      //     objTrans = objConn.BeginTransaction(IsolationLevel.ReadCommitted);
      // } catch (error) {}

      // objCmd.Connection = objConn;
      // objCmd.CommandType = CommandType.StoredProcedure;
      // objCmd.CommandText = strStoredProcedure;
      // objCmd.Transaction = objTrans;

      // // Parametros de Entrada
      // objCmd.Parameters.AddWithValue("P_COD_OPEA", objConsulta.P_COD_OPEA).Direction = ParameterDirection.Input;
      // // Parametros de Entrada

      // // Parametros de Saida
      // objCmd.Parameters.Add("P_MENS_ERRO", OracleType.VarChar, 2000).Direction = ParameterDirection.Output;
      // objCmd.Parameters.Add("P_CURSOR", OracleType.Cursor).Direction = ParameterDirection.Output;
      // // Parametros de Saida

      // dtReader = objCmd.ExecuteReader();

      // while (dtReader.Read()) {
      //     objUsuarioVO = new SOE5P03_LISTA_ZONA_VO();
      //     objUsuarioVO.P_COD_ZONA = dtReader["P_COD_ZONA"].toString();
      //     objUsuarioVO.P_SGL_ZONA = dtReader["P_SGL_ZONA"].toString();
      //     objUsuarioVO.P_TXT_DCR_ZONA = dtReader["P_TXT_DCR_ZONA"].toString();
      //     objUsuarioVO.P_MENS_ERRO = objCmd.Parameters["P_MENS_ERRO"].Value.toString();
      //     objListaUsuarioVO.push(objUsuarioVO);
      // }
      // } catch (ex) {
      // objUsuarioVO = new SOE5P03_LISTA_ZONA_VO();
      // objUsuarioVO.P_MENS_ERRO = ex.message.toString() + " - " + (objCmd.Parameters["P_MENS_ERRO"].Value === null || objCmd.Parameters["P_MENS_ERRO"].Value === undefined ? "" : objCmd.Parameters["P_MENS_ERRO"].Value);
      // objListaUsuarioVO.push(objUsuarioVO);
      // } finally {
      // try {
      //     objTrans.Rollback();
      // } catch (error) {}

      // objConn.Close();
      // }

      return objListaUsuarioVO;
  }
}
