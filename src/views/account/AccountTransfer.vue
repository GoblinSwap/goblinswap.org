<template>
  <div class="account_view">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      top="22vh"
      width="540px">
      <div class="account_dialog">
        
        <div  class="dialog_head">
          <div class="dialog_title">{{this.$t('swap.swap59')}}</div>
          <!-- <div class="dialog_close" @click="btnDialogClose"><i class="el-icon-close"></i></div> -->
        </div>
        <div class="dialog_detail">
          <p class="dialog_copy"><span>{{this.$t('swap.swap41')}}</span></p>
          <p class="dialog_account">{{lockBalanceOld}} <span>NULS</span></p>
        </div>
        <p class="dialog_income">{{this.$t('swap.swap60')+lockBalanceOld+this.$t('swap.swap61')}}</p>
        <button class="account_out" @click="btnUnlock">{{this.$t('swap.swap62')}}</button>
      </div>
    </el-dialog>
    <password-bar v-if="isPass==1" :type="passType" @dialogClose="dialogFatherClose" @passSubmitUnLockOld="passSubmitUnLockOld"></password-bar>
  </div>
</template>

<script>

import nuls from 'nuls-sdk-js'
import utils from 'nuls-sdk-js/lib/utils/utils'
import {MAIN_INFO} from '@/config.js'
import {chainID,chainIdNumber,Times,getArgs,Plus,timesDecimals0,Division} from '@/api/util'
import {inputsOrOutputs,validateAndBroadcast,getNulsBalance,countFee} from '@/api/requestData'
import passwordBar from "../../components/Password"
export default {
  components:{
    passwordBar
  },
  data() {
    return {
      isPass:0,
      passType:0,
      dialogVisible: true,
      accountDetail:"",
      lockBalanceOld:"",
      callForm: {
        modelData: [],
        modelValue: '',
        parameterList: [
          {
            name: "amount",
            required: false,
            type: "BigInteger",
            value:  ""
          }
        ],
        senior: false,
        gas: 0, 
        price: 25,
        values: 0,
      },
      addressContractOld:"NULSd6Hgs5jWne1wiyESyJRgRJYnWTkUMi1jx",
      gasInfo: {number: 0, oldNumber: 0},//gas信息
      transferForm: {
        fromAddress: '',
        toAddress: '',
        assetType: '',
        amount: '',
        gas: 1,
        price: 25,
        remarks: '',
        fee: 0.001
      },
      assetsInfo: {},//选中的资产信息
      defaultInfo: {},//默认链信息
    };
  },
  mounted() {
    this.$nextTick(function () {
      let that = this;
      let chain = localStorage.getItem(chainIdNumber());
      this.accountDetail = chain?JSON.parse(chain)[0]:"";
      this.lockBalanceOld = localStorage.getItem("lockBalanceOld");
      this.callForm.parameterList[0].value = timesDecimals0(this.lockBalanceOld).c[0];
      this.defaultInfo = JSON.parse(sessionStorage.getItem('info'))
      this.transferForm.fromAddress = this.addressContractOld;
      //this.getCapitalListByAddress(this.accountDetail.address);
      setTimeout(function(){
        //console.log(that.accountDetail)
        that.getBalanceByAddress(chainID(), 1, that.accountDetail.address);
      },600)

    })
  },
  methods: {
    btnDialogClose(){
      this.$emit("dialogClose",0)
    },
    dialogFatherClose(el){
      this.isPass = el;
    },
    btnUnlock(){
      this.newArgs = getArgs(this.callForm.parameterList);
      if (this.newArgs.allParameter) {
        this.imputedContractCallGas(this.accountDetail.address, 0, this.addressContractOld, "withdrawGiveupReward", "(BigInteger amount) return void", this.newArgs.args,1)
      }
    },  
    /**
     * 预估调用合约交易的gas
     * @param sender
     * @param value
     * @param contractAddress
     * @param methodName
     * @param methodDesc
     * @param args
     */
    async imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
      return await this.$post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args])
        .then(async (response) => {
          if (response.hasOwnProperty("result")) {
            this.gasInfo.number = response.result.gasLimit;
            this.transferForm.gas = response.result.gasLimit;
            this.callForm.gas = response.result.gasLimit;
            this.transferForm.fee = Number(Plus(Number(Division(Number(Times(this.transferForm.gas, this.transferForm.price)), 10000000)), 0.001));
           this.contractFee = this.transferForm.fee;
            let contractConstructorArgsTypes = await this.getContractMethodArgsTypes(contractAddress, methodName,"(BigInteger amount) return void");
            if (!contractConstructorArgsTypes.success) {
              console.log(JSON.stringify(contractConstructorArgsTypes.data));
              return;
            }
            let newArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes.data);
            this.contractCallData = {
              chainId: MAIN_INFO.chainId,
              sender: sender,
              contractAddress: contractAddress,
              value: value,
              gasLimit: this.transferForm.gas,
              price: this.transferForm.price,
              methodName: methodName,
              methodDesc: methodDesc,
              args: newArgs
            };
            this.passType = 4;
            this.isPass = 1;
            
          } else {
            this.$message({message: this.$t('call.call4'), type: 'error', duration: 1000});
          }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + error, type: 'error', duration: 1000});
        });
    },
    /**
     * 获取合约指定函数的参数类型
     * @param contractAddress
     * @param  methodName
     * @param  methodDesc
     */
    async getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
      return await this.$post('/', 'getContractMethodArgsTypes', [contractAddress, methodName, methodDesc])
        .then((response) => {
          //console.log(response);
          if (response.hasOwnProperty("result")) {
            return {success: true, data: response.result};
          } else {
            return {success: false, data: response.error};
          }
        })
        .catch((error) => {
          return {success: false, data: error};
        });
    },





/**
     * 获取账户余额
     * @param assetChainId
     * @param assetId
     * @param address
     **/
    getBalanceByAddress(assetChainId, assetId, address) {
      getNulsBalance(assetChainId, assetId, address).then((response) => {
        //console.log(response);
        if (response.success) {
          this.balanceInfo = response.data;
        } else {
          this.$message({message: this.$t('public.err2') + response, type: 'error', duration: 3000});
        }
      }).catch((error) => {
        this.$message({message: this.$t('public.err3') + error, type: 'error', duration: 3000});
      });
    },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmitUnLockOld(password) {
        const pri = nuls.decrypteOfAES(this.accountDetail.aesPri, password);
        const newAddressInfo = nuls.importByKey(chainID(), pri, password, this.prefix);
        if (newAddressInfo.address === this.accountDetail.address) {
          //console.log(this.selectionData);
          let pub = this.accountDetail.pub;
          let amount = Number(Times(this.callForm.gas, this.callForm.price));
          let transferInfo = {
            fromAddress: this.accountDetail.address,
            assetsChainId: chainID(),
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          
          amount = Number(Plus(transferInfo.fee, amount));
          if (this.callForm.values > 0) {
            transferInfo.toAddress = this.contractAddress;
            transferInfo.value = Number(timesDecimals0(this.callForm.values));
            transferInfo.amount = Number(Plus(transferInfo.value, amount))
          }
          console.log(transferInfo)
          let remark = '';
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
          //console.log(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //console.log(newFee)
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          //console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            //console.log(response);
            if (response.success) {
              this.$emit("dialogClose",7);
              localStorage.setItem("succType",3);
              localStorage.setItem("unlockHash",response.hash);
              localStorage.setItem("unlockNum",this.lockBalanceOld);
              this.isPass = 0;
            } else {
              if (response.data.code === 'err_0014') {
                this.$message({message: response.data.message, type: 'error', duration: 3000});
              } else {
                this.$message({message: this.$t('error.' + response.data.code), type: 'error', duration: 3000});
              }
            }
          }).catch((err) => {
            this.$message({message: this.$t('public.err1') + err, type: 'error', duration: 3000});
          });
        } else {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 3000});
        }
      },
   
    /**
     * 获取转出地址余额信息
     *  @param assetChainId
     *  @param assetId
     *  @param address
     **/
    async getNulsBalance(assetChainId, assetId, address) {
      try {
        let resData = await getNulsBalance(assetChainId, assetId, address);
        //console.log(resData);
        if (resData.success) {
          return resData.data
        } else {
          return {}
        }
      } catch (error) {
        console.log(error);
        return {}
      }
    },

  },
};
</script>
<style lang="less" scoped>
/deep/.el-dialog {
  background: transparent;
}
/deep/ .el-dialog__header {
  display: none;
}
/deep/.el-dialog__body {
    min-height: 304px;
    background: #222222;
    box-shadow: 0px 1px 4px 0px rgba(255, 255, 255, 0.5);
    border-radius: 22px;
    padding: 29px 70px;
}
  .account_dialog {
    position: relative;

    .account_out {
      height: 58px;
      color: #FFFFFF;
      background: #6FAF1E;
      border-radius: 12px;
      width: 100%;
      margin-top: 45px;
      font-size: 20px;
      font-weight: 600;
      line-height: 18px;
      letter-spacing: 1px;
      cursor: pointer;
    }
    .dialog_detail {
      border-radius: 12px;
      border: 1px solid #5B5B5B;
      margin: 24px auto 0px;
      padding: 19px 24px;
      .dialog_account {
        margin-top: 14px;
        font-size: 16px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 18px;

        span{
          color:#6FAF1E;
        }
      }
      .dialog_copy {
        font-size: 16px;
        font-weight: 400;
        color: #BEBEBE;
      }
      
    }
    .dialog_income {
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 22px;
      letter-spacing: 1px;
      text-align: center;
      margin-top: 34px;
    }
    .dialog_assets {
      font-size: 16px;
      font-weight: 400;
      color: #FFFFFF;
      line-height: 18px;
      letter-spacing: 1px;
      margin-top: 12px;
      span{
        color: #6FAF1E;
      }
    }
    .dialog_head {
      display: flex;
      justify-content: space-between;
      .dialog_title {
        font-size: 24px;
        font-weight: 500;
        color: #BEBEBE;
        line-height: 30px;
        letter-spacing: 1px;
      }
      .dialog_close {
        margin-top: -9px;
        margin-right: -50px;
        color: #ffffff;
        font-size: 30px;
        cursor: pointer;
      }
    }
  }
</style>
